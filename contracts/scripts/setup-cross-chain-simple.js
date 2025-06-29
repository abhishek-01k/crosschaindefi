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

const setupCrossChainSimple = async () => {
  console.log("\n🌐 SETTING UP CROSS-CHAIN COMMUNICATION (SIMPLIFIED)...");
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
    // Step 1: Setup Hub to support spoke chains
    console.log("\n🎯 Step 1: Adding spoke chains as supported chains in hub...");
    
    // Connect to hub on Fuji network
    const fujiProvider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc");
    const hubSigner = new ethers.Wallet(process.env.PRIVATE_KEY, fujiProvider);
    
    const hubContract = await ethers.getContractAt(
      'CrossChainDefiHub',
      hubDeployment.contracts.CrossChainDefiHub,
      hubSigner
    );
    
    // Add each spoke chain as supported
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      const spokeChainConfig = getChainlinkConfig(spokeName);
      
      console.log(`\n📋 Adding ${spokeName.toUpperCase()} as supported chain...`);
      console.log(`   Chain Selector: ${spokeChainConfig.chainSelector}`);
      
      try {
        const tx = await hubContract.addSupportedChain(spokeChainConfig.chainSelector);
        await tx.wait();
        console.log(`✅ Added ${spokeName} as supported chain`);
        
        await sleep(2000); // Wait 2 seconds between transactions
        
      } catch (error) {
        if (error.message.includes("already exists") || error.message.includes("already supported")) {
          console.log(`ℹ️  ${spokeName} chain already supported`);
        } else {
          console.log(`❌ Failed to add ${spokeName}: ${error.message}`);
        }
      }
    }
    
    // Step 2: Fund information and status
    console.log("\n💰 Step 2: LINK Token Funding Requirements...");
    
    console.log("\n🚰 Get LINK tokens from faucets:");
    console.log("   - Avalanche Fuji: https://faucets.chain.link/fuji");
    console.log("   - Base Sepolia: https://faucets.chain.link/base-sepolia");
    console.log("   - Ethereum Sepolia: https://faucets.chain.link/sepolia");
    
    console.log("\n💰 Send LINK tokens to these contracts:");
    console.log(`🏛️  Hub Contracts (Fuji):`);
    Object.entries(hubDeployment.contracts).forEach(([name, address]) => {
      console.log(`   - ${name}: ${address}`);
    });
    
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      console.log(`\n🔗 ${spokeName.toUpperCase()} Contracts:`);
      Object.entries(deployment.contracts).forEach(([name, address]) => {
        console.log(`   - ${name}: ${address}`);
      });
    }
    
    // Step 3: Configuration Status
    console.log("\n📊 CROSS-CHAIN SETUP STATUS:");
    console.log("=".repeat(60));
    console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
    console.log(`   Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
    console.log(`   Chain Selector: ${getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain).chainSelector}`);
    
    for (const [spokeName, deployment] of Object.entries(spokeDeployments)) {
      const spokeConfig = getChainlinkConfig(spokeName);
      console.log(`\n🔗 Spoke Chain: ${spokeName.toUpperCase()}`);
      console.log(`   Chain Selector: ${spokeConfig.chainSelector}`);
      console.log(`   Depositor: ${deployment.contracts.CrossChainDepositor}`);
      console.log(`   Minter: ${deployment.contracts.CrossChainMinter}`);
      console.log(`   Hub Address (configured): ${deployment.hubAddress}`);
    }
    
    console.log("\n✅ CROSS-CHAIN SETUP COMPLETED!");
    console.log("\n📝 How the CCIP Communication Works:");
    console.log("1. 🏛️  Hub contract can send messages to any supported chain");
    console.log("2. 🔗 Spoke contracts automatically only accept messages from their configured hub");
    console.log("3. 🌐 CCIP handles the cross-chain message validation and delivery");
    console.log("4. 💰 Contracts need LINK tokens to pay for CCIP messaging fees");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Fund all contracts with LINK tokens (2-5 LINK each)");
    console.log("2. Add contracts to Chainlink subscriptions (VRF/Functions)");
    console.log("3. Test CCIP messaging with: bun run test:ccip");
    console.log("4. Configure supported tokens for deposits/borrowing");
    
    return true;
    
  } catch (error) {
    console.error(`❌ Cross-chain setup failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🌐 CrossChainDefi Simplified Cross-Chain Setup");
  console.log("="  .repeat(60));
  
  try {
    await setupCrossChainSimple();
    console.log("\n🎉 SIMPLIFIED CROSS-CHAIN SETUP COMPLETED SUCCESSFULLY!");
    
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
  setupCrossChainSimple,
  main
}; 