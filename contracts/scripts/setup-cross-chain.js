const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const path = require('path');

// Import deployment configuration
const {
  DEPLOYMENT_CONFIG,
  getChainlinkConfig,
  validateNetwork
} = require('../deployment.config');

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loadDeploymentInfo = (networkName) => {
  const filePath = path.join(__dirname, '../deployments', `${networkName}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
};

const setupCrossChainCommunication = async () => {
  console.log("\n🌐 SETTING UP CROSS-CHAIN COMMUNICATION...");
  console.log("=".repeat(60));
  
  // Load all deployment info
  const hubDeployment = loadDeploymentInfo(DEPLOYMENT_CONFIG.hubChain);
  if (!hubDeployment) {
    throw new Error(`❌ Hub deployment not found. Deploy hub first on ${DEPLOYMENT_CONFIG.hubChain}`);
  }
  
  console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
  console.log(`   Hub Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
  
  // Load spoke deployments
  const spokeDeployments = {};
  for (const spokeName of DEPLOYMENT_CONFIG.spokeChains) {
    const deployment = loadDeploymentInfo(spokeName);
    if (deployment) {
      spokeDeployments[spokeName] = deployment;
      console.log(`🔗 Spoke Chain: ${spokeName.toUpperCase()}`);
      console.log(`   Depositor: ${deployment.contracts.CrossChainDepositor}`);
      console.log(`   Minter: ${deployment.contracts.CrossChainMinter}`);
    } else {
      console.log(`⚠️  No deployment found for spoke chain: ${spokeName}`);
    }
  }
  
  if (Object.keys(spokeDeployments).length === 0) {
    throw new Error("❌ No spoke deployments found. Deploy spoke contracts first.");
  }
  
  try {
    // Step 1: Setup Hub to recognize spoke contracts
    console.log("\n🎯 Step 1: Configuring Hub to recognize spoke contracts...");
    
    // Connect to hub on Fuji network
    const fujiProvider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc");
    const hubSigner = new ethers.Wallet(process.env.PRIVATE_KEY, fujiProvider);
    
    const hubContract = await ethers.getContractAt(
      'CrossChainDefiHub',
      hubDeployment.contracts.CrossChainDefiHub,
      hubSigner
    );
    
    // Register each spoke chain with the hub
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      const spokeChainConfig = getChainlinkConfig(spokeName);
      
      console.log(`\n📋 Registering ${spokeName.toUpperCase()} with hub...`);
      console.log(`   Chain Selector: ${spokeChainConfig.chainSelector}`);
      console.log(`   Depositor: ${deployment.contracts.CrossChainDepositor}`);
      console.log(`   Minter: ${deployment.contracts.CrossChainMinter}`);
      
      try {
        // Register spoke chain depositor
        const tx1 = await hubContract.setSpokeContract(
          spokeChainConfig.chainSelector,
          deployment.contracts.CrossChainDepositor,
          0 // ContractType.DEPOSITOR
        );
        await tx1.wait();
        console.log(`✅ Registered depositor with hub`);
        
        await sleep(2000); // Wait 2 seconds between transactions
        
        // Register spoke chain minter
        const tx2 = await hubContract.setSpokeContract(
          spokeChainConfig.chainSelector,
          deployment.contracts.CrossChainMinter,
          1 // ContractType.MINTER
        );
        await tx2.wait();
        console.log(`✅ Registered minter with hub`);
        
        await sleep(2000);
        
        // Set spoke chain as allowed sender
        const tx3 = await hubContract.setAllowedSender(
          spokeChainConfig.chainSelector,
          deployment.contracts.CrossChainDepositor,
          true
        );
        await tx3.wait();
        console.log(`✅ Set depositor as allowed sender`);
        
        await sleep(2000);
        
        const tx4 = await hubContract.setAllowedSender(
          spokeChainConfig.chainSelector,
          deployment.contracts.CrossChainMinter,
          true
        );
        await tx4.wait();
        console.log(`✅ Set minter as allowed sender`);
        
      } catch (error) {
        console.log(`❌ Failed to register ${spokeName}: ${error.message}`);
      }
    }
    
    // Step 2: Setup spoke contracts to recognize hub
    console.log("\n🔄 Step 2: Configuring spoke contracts to recognize hub...");
    
    const hubChainConfig = getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain);
    
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      console.log(`\n🔧 Setting up ${spokeName.toUpperCase()} spoke contracts...`);
      
      try {
        // Get the appropriate RPC URL and signer for this spoke chain
        let rpcUrl, privateKey;
        
        if (spokeName === 'baseSepolia') {
          rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
          privateKey = process.env.PRIVATE_KEY;
        } else if (spokeName === 'sepolia') {
          rpcUrl = process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org";
          privateKey = process.env.PRIVATE_KEY;
        }
        
        if (!rpcUrl || !privateKey) {
          console.log(`⚠️  Missing RPC URL or private key for ${spokeName}`);
          continue;
        }
        
        const spokeProvider = new ethers.JsonRpcProvider(rpcUrl);
        const spokeSigner = new ethers.Wallet(privateKey, spokeProvider);
        
        // Setup depositor
        const depositorContract = await ethers.getContractAt(
          'CrossChainDepositor',
          deployment.contracts.CrossChainDepositor,
          spokeSigner
        );
        
        const tx1 = await depositorContract.setAllowedSender(
          hubChainConfig.chainSelector,
          hubDeployment.contracts.CrossChainDefiHub,
          true
        );
        await tx1.wait();
        console.log(`✅ Depositor: Set hub as allowed sender`);
        
        await sleep(2000);
        
        // Setup minter
        const minterContract = await ethers.getContractAt(
          'CrossChainMinter',
          deployment.contracts.CrossChainMinter,
          spokeSigner
        );
        
        const tx2 = await minterContract.setAllowedSender(
          hubChainConfig.chainSelector,
          hubDeployment.contracts.CrossChainDefiHub,
          true
        );
        await tx2.wait();
        console.log(`✅ Minter: Set hub as allowed sender`);
        
      } catch (error) {
        console.log(`❌ Failed to configure ${spokeName} spoke contracts: ${error.message}`);
      }
    }
    
    // Step 3: Summary
    console.log("\n📊 CROSS-CHAIN SETUP SUMMARY:");
    console.log("=".repeat(60));
    console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
    console.log(`   Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
    console.log(`   Chain Selector: ${hubChainConfig.chainSelector}`);
    
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      const spokeConfig = getChainlinkConfig(spokeName);
      console.log(`\n🔗 Spoke Chain: ${spokeName.toUpperCase()}`);
      console.log(`   Chain Selector: ${spokeConfig.chainSelector}`);
      console.log(`   Depositor: ${deployment.contracts.CrossChainDepositor}`);
      console.log(`   Minter: ${deployment.contracts.CrossChainMinter}`);
    }
    
    console.log("\n✅ CROSS-CHAIN SETUP COMPLETED!");
    console.log("\n📝 Next Steps:");
    console.log("1. Fund contracts with LINK tokens");
    console.log("2. Test CCIP messaging with test script");
    console.log("3. Configure supported tokens");
    console.log("4. Set up price feeds");
    
    return true;
    
  } catch (error) {
    console.error(`❌ Cross-chain setup failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🌐 CrossChainDefi Cross-Chain Communication Setup");
  console.log("="  .repeat(60));
  
  try {
    await setupCrossChainCommunication();
    console.log("\n🎉 CROSS-CHAIN SETUP COMPLETED SUCCESSFULLY!");
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
};

// Execute setup
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  setupCrossChainCommunication,
  main
}; 