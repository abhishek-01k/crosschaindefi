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

const deployHubContracts = async (networkName) => {
  console.log(`\n🏛️  DEPLOYING HUB CONTRACTS TO ${networkName.toUpperCase()}...`);
  console.log("=".repeat(60));
  
  // Validate this is the hub chain
  if (networkName !== DEPLOYMENT_CONFIG.hubChain) {
    throw new Error(`❌ This script is for hub chain deployment only. Expected: ${DEPLOYMENT_CONFIG.hubChain}, Got: ${networkName}`);
  }
  
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
    console.log("\n🏗️  Step 1: Deploying CrossChainDefiHub (Main Protocol Contract)");
    const hubResult = await deployContract('CrossChainDefiHub', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.functionsRouter,
      chainlinkConfig.vrfCoordinator,
      vrfConfig.subscriptionId,
      chainlinkConfig.keyHash
    ]);
    deploymentResults.CrossChainDefiHub = hubResult;
    
    console.log("\n🤖 Step 2: Deploying ArbitrageCoordinatorAgent");
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
    
    console.log("\n📊 Step 3: Deploying MarketIntelligenceAgent");
    const marketResult = await deployContract('MarketIntelligenceAgent', [
      chainlinkConfig.functionsRouter,
      chainlinkConfig.linkToken,
      functionsConfig.subscriptionId,
      getDonIdBytes32(networkName),
      hubResult.address
    ]);
    deploymentResults.MarketIntelligenceAgent = marketResult;
    
    console.log("\n🔗 Step 4: Setting up AI agent relationships in hub...");
    
    // Set agent addresses in hub (AgentType enum: ARBITRAGE_COORDINATOR = 0, MARKET_INTELLIGENCE = 1)
    await hubResult.contract.setAgentAddress(0, arbitrageResult.address); // ARBITRAGE_COORDINATOR
    await hubResult.contract.setAgentAddress(1, marketResult.address);    // MARKET_INTELLIGENCE
    console.log("✅ Agent addresses configured in hub");
    
    // Grant roles to agents
    const AGENT_ROLE = await hubResult.contract.AGENT_ROLE();
    await hubResult.contract.grantRole(AGENT_ROLE, arbitrageResult.address);
    await hubResult.contract.grantRole(AGENT_ROLE, marketResult.address);
    console.log("✅ Agent roles granted");
    
    console.log("\n📊 HUB DEPLOYMENT SUMMARY:");
    console.log("=".repeat(60));
    console.log(`🏛️  Hub Chain: ${networkName.toUpperCase()}`);
    console.log(`📍 Chain ID: ${hre.network.config.chainId}`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log("\n📋 Deployed Contracts:");
    Object.entries(deploymentResults).forEach(([name, result]) => {
      console.log(`  ${name.padEnd(25)}: ${result.address}`);
    });
    console.log("=".repeat(60));
    
    // Save deployment information
    const deploymentInfo = {
      network: networkName,
      chainId: hre.network.config.chainId,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      deploymentType: 'hub',
      chainlinkConfig,
      vrfConfig,
      functionsConfig,
      protocolConfig: PROTOCOL_CONFIG,
      contracts: Object.fromEntries(
        Object.entries(deploymentResults).map(([name, result]) => [name, result.address])
      ),
      gasUsed: {
        estimated: "~8,000,000 gas total (hub contracts)"
      }
    };
    
    saveDeploymentInfo(networkName, deploymentInfo);
    
    console.log("\n✅ HUB DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("\n📝 Next steps:");
    console.log("1. Deploy spoke contracts on other chains (use deploy-spoke.js)");
    console.log("2. Fund VRF subscription with LINK tokens");
    console.log("3. Add consumer contracts to VRF subscription");
    console.log("4. Set up Chainlink Functions subscriptions");
    console.log("5. Configure supported tokens and price feeds");
    
    return deploymentResults;
    
  } catch (error) {
    console.error(`❌ Hub deployment failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🏛️  CrossChainDefi Hub Deployment Script");
  console.log("📍 This script deploys the main hub contracts (Hub + AI Agents)");
  console.log("="  .repeat(60));
  
  const networkName = network.name;
  
  // Validate this is hub network
  if (networkName !== DEPLOYMENT_CONFIG.hubChain) {
    console.log(`❌ This script is for hub chain deployment only!`);
    console.log(`Expected hub chain: ${DEPLOYMENT_CONFIG.hubChain}`);
    console.log(`Current network: ${networkName}`);
    console.log(`\nUse deploy-spoke.js for spoke chain deployments.`);
    process.exit(1);
  }
  
  try {
    const deploymentResults = await deployHubContracts(networkName);
    
    console.log("\n🎉 HUB DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("🚀 Ready to deploy spoke contracts on other chains!");
    
  } catch (error) {
    console.error(`❌ Hub deployment failed: ${error.message}`);
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
  deployHubContracts,
  main
}; 