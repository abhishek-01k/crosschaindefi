const hre = require("hardhat");
const { network } = hre;
const fs = require('fs');
const path = require('path');

// Import deployment configuration
const {
  CHAINLINK_ADDRESSES,
  VRF_CONFIG,
  FUNCTIONS_CONFIG,
  PROTOCOL_CONFIG,
  DEPLOYMENT_CONFIG,
  DEPLOYMENT_ORDER,
  getChainlinkConfig,
  getVRFConfig,
  getFunctionsConfig,
  getDonIdBytes32,
  validateNetwork,
  validateEnvironment
} = require('../deployment.config');

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to convert BigInt values to strings for JSON serialization
const bigIntReplacer = (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const saveDeploymentInfo = (networkName, deploymentInfo) => {
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, bigIntReplacer, 2));
  console.log(`💾 Deployment info saved to deployments/${networkName}.json`);
};

const loadDeploymentInfo = (networkName) => {
  const filePath = path.join(__dirname, '../deployments', `${networkName}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
};

const verifyContract = async (contractAddress, constructorArgs, networkName) => {
  try {
    console.log(`🔍 Verifying contract at ${contractAddress}...`);
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      network: networkName
    });
    console.log(`✅ Contract verified successfully`);
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    if (error.message.includes("Already Verified")) {
      console.log(`ℹ️  Contract already verified`);
    }
  }
};

const deployContract = async (contractName, constructorArgs, options = {}) => {
  console.log(`\n📦 Deploying ${contractName}...`);
  
  const ContractFactory = await hre.ethers.getContractFactory(contractName);
  
  // Prepare deployment options
  const deployOptions = {
    gasLimit: options.gasLimit || DEPLOYMENT_CONFIG.gasSettings.gasLimit
  };
  
  // Only set gasPrice if it's not "auto"
  const gasPrice = options.gasPrice || DEPLOYMENT_CONFIG.gasSettings.gasPrice;
  if (gasPrice !== "auto") {
    deployOptions.gasPrice = gasPrice;
  }
  
  const contract = await ContractFactory.deploy(...constructorArgs, deployOptions);
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ ${contractName} deployed to: ${contractAddress}`);
  
  // Wait for block confirmations
  await sleep(DEPLOYMENT_CONFIG.verificationDelay * 1000);
  
  return { contract, address: contractAddress };
};

const deployToNetwork = async (networkName) => {
  console.log(`\n🚀 Starting deployment to ${networkName.toUpperCase()}...`);
  console.log("=".repeat(60));
  
  // Validate network and environment
  validateNetwork(networkName);
  validateEnvironment();
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  
  // Get configurations
  const chainlinkConfig = getChainlinkConfig(networkName);
  const vrfConfig = getVRFConfig(networkName);
  const functionsConfig = getFunctionsConfig(networkName);
  
  console.log("\n🔗 Using Chainlink configuration:");
  console.log(`  Router: ${chainlinkConfig.router}`);
  console.log(`  LINK Token: ${chainlinkConfig.linkToken}`);
  console.log(`  Functions Router: ${chainlinkConfig.functionsRouter}`);
  console.log(`  VRF Coordinator: ${chainlinkConfig.vrfCoordinator}`);
  console.log(`  Chain Selector: ${chainlinkConfig.chainSelector}`);
  
  const deploymentResults = {};
  
  try {
    // Deploy CrossChainDefiHub (main contract)
    const hubResult = await deployContract('CrossChainDefiHub', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.functionsRouter,
      chainlinkConfig.vrfCoordinator,
      vrfConfig.subscriptionId,
      chainlinkConfig.keyHash
    ]);
    deploymentResults.CrossChainDefiHub = hubResult;
    
    // Deploy CrossChainDepositor
    const depositorResult = await deployContract('CrossChainDepositor', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.chainSelector,
      hubResult.address
    ]);
    deploymentResults.CrossChainDepositor = depositorResult;
    
    // Deploy CrossChainMinter
    const minterResult = await deployContract('CrossChainMinter', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.chainSelector,
      hubResult.address,
      `CrossChainDefi ${networkName}`,
      `CCD-${networkName.toUpperCase()}`
    ]);
    deploymentResults.CrossChainMinter = minterResult;
    
    // Deploy ArbitrageCoordinatorAgent
    const arbitrageResult = await deployContract('ArbitrageCoordinatorAgent', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.functionsRouter,
      chainlinkConfig.vrfCoordinator,
      vrfConfig.subscriptionId,
      chainlinkConfig.keyHash,
      getDonIdBytes32(networkName),
      hubResult.address
    ]);
    deploymentResults.ArbitrageCoordinatorAgent = arbitrageResult;
    
    // Deploy MarketIntelligenceAgent
    const marketResult = await deployContract('MarketIntelligenceAgent', [
      chainlinkConfig.functionsRouter,
      chainlinkConfig.linkToken,
      functionsConfig.subscriptionId,
      getDonIdBytes32(networkName),
      hubResult.address
    ]);
    deploymentResults.MarketIntelligenceAgent = marketResult;
    
    console.log("\n🔗 Step 6: Setting up cross-contract relationships...");
    
    // Set agent addresses in hub (AgentType enum: ARBITRAGE_COORDINATOR = 0, MARKET_INTELLIGENCE = 1)
    await hubResult.contract.setAgentAddress(0, arbitrageResult.address); // ARBITRAGE_COORDINATOR
    await hubResult.contract.setAgentAddress(1, marketResult.address);    // MARKET_INTELLIGENCE
    console.log("✅ Agent addresses configured in hub");
    
    // Grant roles to agents
    const AGENT_ROLE = await hubResult.contract.AGENT_ROLE();
    await hubResult.contract.grantRole(AGENT_ROLE, arbitrageResult.address);
    await hubResult.contract.grantRole(AGENT_ROLE, marketResult.address);
    console.log("✅ Agent roles granted");
    
    // Note: Depositor and Minter contracts don't need direct agent registration
    // They interact with agents through the hub contract
    console.log("ℹ️  Depositor and Minter contracts work through hub - no direct agent registration needed");
    
    // Set up cross-chain configurations
    if (networkName !== DEPLOYMENT_CONFIG.hubChain) {
      // Note: Hub chain selector is set during contract construction
      // No additional configuration needed at deployment time
      const hubChainSelector = getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain).chainSelector;
      console.log(`ℹ️  Hub chain selector: ${hubChainSelector} (configured during construction)`);
    }
    
    console.log("\n📊 Deployment Summary:");
    console.log("=".repeat(60));
    Object.entries(deploymentResults).forEach(([name, result]) => {
      console.log(`${name.padEnd(25)}: ${result.address}`);
    });
    console.log("=".repeat(60));
    
    // Save deployment information
    const deploymentInfo = {
      network: networkName,
      chainId: hre.network.config.chainId,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      chainlinkConfig,
      vrfConfig,
      functionsConfig,
      protocolConfig: PROTOCOL_CONFIG,
      contracts: Object.fromEntries(
        Object.entries(deploymentResults).map(([name, result]) => [name, result.address])
      ),
      gasUsed: {
        // Note: actual gas used would need to be tracked during deployment
        estimated: "~12,000,000 gas total"
      }
    };
    
    saveDeploymentInfo(networkName, deploymentInfo);
    
    console.log("\n✅ Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Fund VRF subscription with LINK tokens");
    console.log("2. Add consumer contracts to VRF subscription");
    console.log("3. Set up Chainlink Functions subscriptions");
    console.log("4. Configure supported tokens and price feeds");
    console.log("5. Set up cross-chain allowed senders");
    
    return deploymentResults;
    
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🚀 CrossChainDefi Multi-Network Deployment Script");
  console.log("=" .repeat(60));
  
  const networkName = network.name;
  
  // Check if this is a supported network
  if (!DEPLOYMENT_CONFIG.networks.includes(networkName)) {
    console.log(`❌ Network ${networkName} is not in the supported deployment networks`);
    console.log(`Supported networks: ${DEPLOYMENT_CONFIG.networks.join(', ')}`);
    process.exit(1);
  }
  
  try {
    const deploymentResults = await deployToNetwork(networkName);
    
    // Optional: Verify contracts after deployment
    if (process.env.VERIFY_CONTRACTS === 'true') {
      console.log("\n🔍 Starting contract verification...");
      await sleep(30000); // Wait 30 seconds before verification
      
      const deploymentInfo = loadDeploymentInfo(networkName);
      if (deploymentInfo) {
        // Verify each contract (implementation would need actual constructor args)
        // This is a placeholder - actual verification would require proper constructor args
        console.log("⚠️  Contract verification requires manual setup of constructor arguments");
      }
    }
    
    console.log("\n🎉 All operations completed successfully!");
    
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
};

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  deployToNetwork,
  main
}; 