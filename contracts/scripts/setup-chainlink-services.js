const hre = require("hardhat");
const { network } = hre;
const fs = require('fs');
const path = require('path');

// Import deployment configuration
const {
  CHAINLINK_ADDRESSES,
  VRF_CONFIG,
  FUNCTIONS_CONFIG,
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

const setupChainlinkServices = async (networkName) => {
  console.log(`\n🔗 SETTING UP CHAINLINK SERVICES ON ${networkName.toUpperCase()}...`);
  console.log("=".repeat(60));
  
  validateNetwork(networkName);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Using account: ${deployer.address}`);
  
  // Load deployment info
  const deploymentInfo = loadDeploymentInfo(networkName);
  if (!deploymentInfo) {
    throw new Error(`❌ No deployment info found for ${networkName}. Deploy contracts first.`);
  }
  
  const chainlinkConfig = getChainlinkConfig(networkName);
  console.log(`\n🔗 Chainlink configuration for ${networkName}:`);
  console.log(`  Router: ${chainlinkConfig.router}`);
  console.log(`  LINK Token: ${chainlinkConfig.linkToken}`);
  
  // Get contract instances
  const contracts = {};
  
  if (deploymentInfo.deploymentType === 'hub') {
    // Hub contracts
    contracts.hub = await hre.ethers.getContractAt(
      'CrossChainDefiHub', 
      deploymentInfo.contracts.CrossChainDefiHub
    );
    contracts.arbitrage = await hre.ethers.getContractAt(
      'ArbitrageCoordinatorAgent', 
      deploymentInfo.contracts.ArbitrageCoordinatorAgent
    );
    contracts.market = await hre.ethers.getContractAt(
      'MarketIntelligenceAgent', 
      deploymentInfo.contracts.MarketIntelligenceAgent
    );
    
    console.log("\n🏛️  Hub Contracts Found:");
    console.log(`  Hub: ${deploymentInfo.contracts.CrossChainDefiHub}`);
    console.log(`  Arbitrage Agent: ${deploymentInfo.contracts.ArbitrageCoordinatorAgent}`);
    console.log(`  Market Agent: ${deploymentInfo.contracts.MarketIntelligenceAgent}`);
    
  } else if (deploymentInfo.deploymentType === 'spoke') {
    // Spoke contracts
    contracts.depositor = await hre.ethers.getContractAt(
      'CrossChainDepositor', 
      deploymentInfo.contracts.CrossChainDepositor
    );
    contracts.minter = await hre.ethers.getContractAt(
      'CrossChainMinter', 
      deploymentInfo.contracts.CrossChainMinter
    );
    
    console.log("\n🔗 Spoke Contracts Found:");
    console.log(`  Depositor: ${deploymentInfo.contracts.CrossChainDepositor}`);
    console.log(`  Minter: ${deploymentInfo.contracts.CrossChainMinter}`);
  }
  
  try {
    // Step 1: VRF Subscription Setup (for hub contracts only)
    if (deploymentInfo.deploymentType === 'hub') {
      console.log("\n🎲 Step 1: Setting up VRF Subscription...");
      
      const vrfSubscriptionId = process.env[`VRF_SUBSCRIPTION_ID_${networkName.toUpperCase()}`] || 
                                process.env.VRF_SUBSCRIPTION_ID_FUJI;
      
      if (vrfSubscriptionId) {
        console.log(`📋 VRF Subscription ID: ${vrfSubscriptionId}`);
        console.log("ℹ️  To add consumers to VRF subscription, visit:");
        console.log(`   https://vrf.chain.link/`);
        console.log("   Add these consumer addresses:");
        console.log(`   - Hub: ${deploymentInfo.contracts.CrossChainDefiHub}`);
        console.log(`   - Arbitrage Agent: ${deploymentInfo.contracts.ArbitrageCoordinatorAgent}`);
      } else {
        console.log("⚠️  VRF Subscription ID not found in environment variables");
      }
    }
    
    // Step 2: Functions Subscription Setup
    console.log("\n🔧 Step 2: Setting up Chainlink Functions...");
    
    const functionsSubscriptionId = process.env[`FUNCTIONS_SUBSCRIPTION_ID_${networkName.toUpperCase()}`] || 
                                   process.env.FUNCTIONS_SUBSCRIPTION_ID_FUJI;
    
    if (functionsSubscriptionId) {
      console.log(`📋 Functions Subscription ID: ${functionsSubscriptionId}`);
      console.log("ℹ️  To add consumers to Functions subscription, visit:");
      console.log(`   https://functions.chain.link/`);
      
      if (deploymentInfo.deploymentType === 'hub') {
        console.log("   Add these consumer addresses:");
        console.log(`   - Hub: ${deploymentInfo.contracts.CrossChainDefiHub}`);
        console.log(`   - Arbitrage Agent: ${deploymentInfo.contracts.ArbitrageCoordinatorAgent}`);
        console.log(`   - Market Agent: ${deploymentInfo.contracts.MarketIntelligenceAgent}`);
      }
    } else {
      console.log("⚠️  Functions Subscription ID not found in environment variables");
    }
    
    // Step 3: CCIP Allowed Senders Setup
    console.log("\n🌐 Step 3: Setting up CCIP Allowed Senders...");
    
    if (deploymentInfo.deploymentType === 'spoke') {
      // For spoke contracts, we need to set the hub as allowed sender
      const hubChainSelector = getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain).chainSelector;
      const hubDeployment = loadDeploymentInfo(DEPLOYMENT_CONFIG.hubChain);
      
      if (hubDeployment) {
        console.log(`🎯 Setting hub as allowed sender...`);
        console.log(`   Hub Chain Selector: ${hubChainSelector}`);
        console.log(`   Hub Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
        
        // Set allowed sender for Depositor
        try {
          const tx1 = await contracts.depositor.setAllowedSender(
            hubChainSelector,
            hubDeployment.contracts.CrossChainDefiHub,
            true
          );
          await tx1.wait();
          console.log(`✅ Depositor: Set hub as allowed sender`);
        } catch (error) {
          console.log(`⚠️  Depositor setAllowedSender failed: ${error.message}`);
        }
        
        // Set allowed sender for Minter
        try {
          const tx2 = await contracts.minter.setAllowedSender(
            hubChainSelector,
            hubDeployment.contracts.CrossChainDefiHub,
            true
          );
          await tx2.wait();
          console.log(`✅ Minter: Set hub as allowed sender`);
        } catch (error) {
          console.log(`⚠️  Minter setAllowedSender failed: ${error.message}`);
        }
      }
    }
    
    // Step 4: Fund contracts with LINK tokens
    console.log("\n💰 Step 4: LINK Token Funding...");
    console.log("ℹ️  Your contracts need LINK tokens for CCIP messaging.");
    console.log("   Get LINK tokens from faucet:");
    
    if (networkName === 'fuji') {
      console.log("   🚰 Avalanche Fuji LINK Faucet: https://faucets.chain.link/fuji");
    } else if (networkName === 'baseSepolia') {
      console.log("   🚰 Base Sepolia LINK Faucet: https://faucets.chain.link/base-sepolia");
    } else if (networkName === 'sepolia') {
      console.log("   🚰 Ethereum Sepolia LINK Faucet: https://faucets.chain.link/sepolia");
    }
    
    console.log("\n   Send LINK to these addresses:");
    Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
      console.log(`   - ${name}: ${address}`);
    });
    
    console.log("\n✅ CHAINLINK SERVICES SETUP COMPLETED!");
    console.log("\n📝 Manual Steps Required:");
    console.log("1. Add consumer contracts to VRF subscription (if hub)");
    console.log("2. Add consumer contracts to Functions subscription");
    console.log("3. Fund contracts with LINK tokens");
    console.log("4. Test CCIP messaging with test script");
    
    return true;
    
  } catch (error) {
    console.error(`❌ Chainlink services setup failed: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  console.log("🔗 CrossChainDefi Chainlink Services Setup");
  console.log("="  .repeat(60));
  
  const networkName = network.name;
  
  try {
    await setupChainlinkServices(networkName);
    console.log("\n🎉 SETUP COMPLETED SUCCESSFULLY!");
    
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
  setupChainlinkServices,
  main
}; 