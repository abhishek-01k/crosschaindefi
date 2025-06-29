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

const deploySpokeContracts = async (networkName, hubAddress = null) => {
  console.log(`\n🔗 DEPLOYING SPOKE CONTRACTS TO ${networkName.toUpperCase()}...`);
  console.log("=".repeat(60));
  
  // Validate this is NOT the hub chain
  if (networkName === DEPLOYMENT_CONFIG.hubChain) {
    throw new Error(`❌ This script is for spoke chain deployment only. Use deploy-hub.js for hub chain: ${DEPLOYMENT_CONFIG.hubChain}`);
  }
  
  // Validate network and environment
  validateNetwork(networkName);
  validateEnvironment();
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  
  // Get configurations
  const chainlinkConfig = getChainlinkConfig(networkName);
  const hubChainConfig = getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain);
  
  console.log("\n🔗 Using Chainlink configuration:");
  console.log(`  Router: ${chainlinkConfig.router}`);
  console.log(`  LINK Token: ${chainlinkConfig.linkToken}`);
  console.log(`  Chain Selector: ${chainlinkConfig.chainSelector}`);
  console.log(`  Hub Chain Selector: ${hubChainConfig.chainSelector}`);
  
  // Get hub contract address
  let crossChainHubAddress = hubAddress;
  if (!crossChainHubAddress) {
    // Try to load from hub deployment
    const hubDeployment = loadDeploymentInfo(DEPLOYMENT_CONFIG.hubChain);
    if (hubDeployment && hubDeployment.contracts && hubDeployment.contracts.CrossChainDefiHub) {
      crossChainHubAddress = hubDeployment.contracts.CrossChainDefiHub;
      console.log(`📋 Using hub address from ${DEPLOYMENT_CONFIG.hubChain} deployment: ${crossChainHubAddress}`);
    } else {
      throw new Error(`❌ Hub contract address not found. Please deploy hub first or provide hub address manually.`);
    }
  }
  
  const deploymentResults = {};
  
  try {
    console.log("\n💰 Step 1: Deploying CrossChainDepositor (Collateral Management)");
    const depositorResult = await deployContract('CrossChainDepositor', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.chainSelector,
      crossChainHubAddress
    ]);
    deploymentResults.CrossChainDepositor = depositorResult;
    
    console.log("\n🏦 Step 2: Deploying CrossChainMinter (Token Minting/Borrowing)");
    const minterResult = await deployContract('CrossChainMinter', [
      chainlinkConfig.router,
      chainlinkConfig.linkToken,
      chainlinkConfig.chainSelector,
      crossChainHubAddress,
      `CrossChainDefi ${networkName}`,
      `CCD-${networkName.toUpperCase()}`
    ]);
    deploymentResults.CrossChainMinter = minterResult;
    
    console.log("\n📊 SPOKE DEPLOYMENT SUMMARY:");
    console.log("=".repeat(60));
    console.log(`🔗 Spoke Chain: ${networkName.toUpperCase()}`);
    console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
    console.log(`📍 Chain ID: ${hre.network.config.chainId}`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🎯 Hub Address: ${crossChainHubAddress}`);
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
      deploymentType: 'spoke',
      hubChain: DEPLOYMENT_CONFIG.hubChain,
      hubAddress: crossChainHubAddress,
      chainlinkConfig,
      protocolConfig: PROTOCOL_CONFIG,
      contracts: Object.fromEntries(
        Object.entries(deploymentResults).map(([name, result]) => [name, result.address])
      ),
      gasUsed: {
        estimated: "~4,000,000 gas total (spoke contracts)"
      }
    };
    
    saveDeploymentInfo(networkName, deploymentInfo);
    
    console.log("\n✅ SPOKE DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("\n📝 Next steps:");
    console.log("1. Register these spoke contracts with the hub chain");
    console.log("2. Set up allowed senders for cross-chain communication");
    console.log("3. Configure supported tokens on this chain");
    console.log("4. Fund contracts with LINK tokens for CCIP messaging");
    console.log("5. Test cross-chain deposit/borrow functionality");
    
    console.log("\n🛠️  Cross-chain setup commands:");
    console.log(`   Hub contract address: ${crossChainHubAddress}`);
    console.log(`   Depositor address: ${depositorResult.address}`);
    console.log(`   Minter address: ${minterResult.address}`);
    console.log(`   Chain selector: ${chainlinkConfig.chainSelector}`);
    
    return deploymentResults;
    
  } catch (error) {
    console.error(`❌ Spoke deployment failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🔗 CrossChainDefi Spoke Deployment Script");
  console.log("📍 This script deploys spoke contracts (Depositor + Minter)");
  console.log("="  .repeat(60));
  
  const networkName = network.name;
  
  // Validate this is NOT hub network
  if (networkName === DEPLOYMENT_CONFIG.hubChain) {
    console.log(`❌ This script is for spoke chain deployment only!`);
    console.log(`Current network: ${networkName} is the hub chain`);
    console.log(`\nUse deploy-hub.js for hub chain deployments.`);
    process.exit(1);
  }
  
  // Check if network is in supported networks
  if (!DEPLOYMENT_CONFIG.networks.includes(networkName)) {
    console.log(`❌ Network ${networkName} is not in the supported deployment networks`);
    console.log(`Supported networks: ${DEPLOYMENT_CONFIG.networks.join(', ')}`);
    process.exit(1);
  }
  
  try {
    const deploymentResults = await deploySpokeContracts(networkName);
    
    console.log("\n🎉 SPOKE DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("🔗 Ready to process cross-chain transactions!");
    
  } catch (error) {
    console.error(`❌ Spoke deployment failed: ${error.message}`);
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
  deploySpokeContracts,
  main
}; 