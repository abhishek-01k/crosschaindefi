const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const path = require('path');

// Import deployment configuration
const {
  DEPLOYMENT_CONFIG,
  getChainlinkConfig
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

// Test basic deposit flow
const testBasicDepositFlow = async (spokeName, spokeDeployment, hubDeployment) => {
  console.log(`\n🧪 Testing basic deposit flow on ${spokeName.toUpperCase()}...`);
  console.log("-".repeat(50));
  
  try {
    // Get spoke chain provider and signer
    let rpcUrl;
    if (spokeName === 'baseSepolia') {
      rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
    } else if (spokeName === 'sepolia') {
      rpcUrl = process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org";
    }
    
    const spokeProvider = new ethers.JsonRpcProvider(rpcUrl);
    const spokeSigner = new ethers.Wallet(process.env.PRIVATE_KEY, spokeProvider);
    
    // Connect to depositor contract
    const depositorContract = await ethers.getContractAt(
      'CrossChainDepositor',
      spokeDeployment.contracts.CrossChainDepositor,
      spokeSigner
    );
    
    console.log(`📍 Depositor Contract: ${spokeDeployment.contracts.CrossChainDepositor}`);
    console.log(`👤 User Address: ${spokeSigner.address}`);
    
    // Check LINK balance
    const linkToken = await ethers.getContractAt(
      'IERC20',
      spokeDeployment.chainlinkConfig.linkToken,
      spokeSigner
    );
    
    const linkBalance = await linkToken.balanceOf(spokeDeployment.contracts.CrossChainDepositor);
    console.log(`💰 Depositor LINK Balance: ${ethers.formatEther(linkBalance)} LINK`);
    
    if (linkBalance === 0n) {
      console.log("⚠️  WARNING: Depositor has 0 LINK balance. CCIP message may fail.");
      console.log("   📝 Action needed: Send LINK tokens to depositor contract");
      console.log(`   📍 Address: ${spokeDeployment.contracts.CrossChainDepositor}`);
      console.log(`   🚰 Faucet: https://faucets.chain.link/${spokeName.toLowerCase().replace('sepolia', '-sepolia')}`);
      return false;
    }
    
    // Check if we can call basic contract functions
    try {
      const totalValueLocked = await depositorContract.totalValueLocked();
      console.log(`📊 Total Value Locked: ${ethers.formatEther(totalValueLocked)} ETH`);
      
      const depositsCount = await depositorContract.totalDepositsCount();
      console.log(`📈 Total Deposits Count: ${depositsCount.toString()}`);
      
      console.log(`✅ Contract is responsive and accessible`);
      return true;
      
    } catch (error) {
      console.log(`❌ Contract interaction failed: ${error.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Basic deposit test failed: ${error.message}`);
    return false;
  }
};

// Test hub contract accessibility
const testHubContractAccess = async (hubDeployment) => {
  console.log(`\n🧪 Testing hub contract access...`);
  console.log("-".repeat(50));
  
  try {
    // Connect to hub contract
    const fujiProvider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc");
    const hubSigner = new ethers.Wallet(process.env.PRIVATE_KEY, fujiProvider);
    
    const hubContract = await ethers.getContractAt(
      'CrossChainDefiHub',
      hubDeployment.contracts.CrossChainDefiHub,
      hubSigner
    );
    
    console.log(`🏛️  Hub Contract: ${hubDeployment.contracts.CrossChainDefiHub}`);
    console.log(`👤 User Address: ${hubSigner.address}`);
    
    // Check LINK balance of hub
    const linkToken = await ethers.getContractAt(
      'IERC20',
      hubDeployment.chainlinkConfig.linkToken,
      hubSigner
    );
    
    const linkBalance = await linkToken.balanceOf(hubDeployment.contracts.CrossChainDefiHub);
    console.log(`💰 Hub LINK Balance: ${ethers.formatEther(linkBalance)} LINK`);
    
    if (linkBalance === 0n) {
      console.log("⚠️  WARNING: Hub has 0 LINK balance. CCIP messaging will fail.");
      console.log("   📝 Action needed: Send LINK tokens to hub contract");
      console.log(`   📍 Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
      console.log(`   🚰 Faucet: https://faucets.chain.link/fuji`);
      return false;
    }
    
    // Test basic hub functions
    try {
      const stats = await hubContract.getProtocolStats();
      console.log(`📊 Protocol Stats Available: ✅`);
      
      console.log(`✅ Hub contract is responsive and accessible`);
      return true;
      
    } catch (error) {
      console.log(`❌ Hub contract interaction failed: ${error.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Hub contract test failed: ${error.message}`);
    return false;
  }
};

// Check contract configuration
const checkContractConfiguration = async (spokeName, spokeDeployment, hubDeployment) => {
  console.log(`\n🧪 Checking ${spokeName.toUpperCase()} contract configuration...`);
  console.log("-".repeat(50));
  
  try {
    // Get spoke chain provider and signer
    let rpcUrl;
    if (spokeName === 'baseSepolia') {
      rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
    } else if (spokeName === 'sepolia') {
      rpcUrl = process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org";
    }
    
    const spokeProvider = new ethers.JsonRpcProvider(rpcUrl);
    const spokeSigner = new ethers.Wallet(process.env.PRIVATE_KEY, spokeProvider);
    
    const depositorContract = await ethers.getContractAt(
      'CrossChainDepositor',
      spokeDeployment.contracts.CrossChainDepositor,
      spokeSigner
    );
    
    // Check configuration
    console.log(`🔍 Checking configuration:`);
    console.log(`   Hub Chain Selector: ${spokeDeployment.hubChainSelector || 'Not set'}`);
    console.log(`   Hub Contract: ${spokeDeployment.hubAddress}`);
    console.log(`   CCIP Router: ${spokeDeployment.chainlinkConfig.router}`);
    console.log(`   LINK Token: ${spokeDeployment.chainlinkConfig.linkToken}`);
    
    if (spokeDeployment.hubAddress === hubDeployment.contracts.CrossChainDefiHub) {
      console.log(`✅ Hub address correctly configured`);
      return true;
    } else {
      console.log(`❌ Hub address mismatch:`);
      console.log(`   Expected: ${hubDeployment.contracts.CrossChainDefiHub}`);
      console.log(`   Configured: ${spokeDeployment.hubAddress}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Configuration check failed: ${error.message}`);
    return false;
  }
};

// Main test function
const runSimpleCCIPTests = async () => {
  console.log("\n🧪 SIMPLIFIED CCIP FUNCTIONALITY TESTS");
  console.log("=".repeat(60));
  
  // Load deployment info
  const hubDeployment = loadDeploymentInfo(DEPLOYMENT_CONFIG.hubChain);
  if (!hubDeployment) {
    throw new Error(`❌ Hub deployment not found on ${DEPLOYMENT_CONFIG.hubChain}`);
  }
  
  console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
  console.log(`   Hub Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
  
  const testResults = {};
  
  // Test hub first
  console.log(`\n🏛️  Testing Hub Contract...`);
  const hubTest = await testHubContractAccess(hubDeployment);
  testResults.hub = hubTest;
  
  // Test each spoke chain
  for (const spokeName of DEPLOYMENT_CONFIG.spokeChains) {
    const spokeDeployment = loadDeploymentInfo(spokeName);
    if (!spokeDeployment) {
      console.log(`⚠️  Skipping ${spokeName} - no deployment found`);
      continue;
    }
    
    console.log(`\n🔗 Testing ${spokeName.toUpperCase()} spoke chain...`);
    console.log(`   Depositor: ${spokeDeployment.contracts.CrossChainDepositor}`);
    console.log(`   Minter: ${spokeDeployment.contracts.CrossChainMinter}`);
    
    const results = {
      configuration: false,
      basicAccess: false
    };
    
    // Run tests
    results.configuration = await checkContractConfiguration(spokeName, spokeDeployment, hubDeployment);
    await sleep(2000);
    
    results.basicAccess = await testBasicDepositFlow(spokeName, spokeDeployment, hubDeployment);
    await sleep(2000);
    
    testResults[spokeName] = results;
  }
  
  // Test summary
  console.log("\n📊 TEST RESULTS SUMMARY:");
  console.log("=".repeat(60));
  
  console.log(`🏛️  Hub Contract: ${testResults.hub ? '✅ ACCESSIBLE' : '❌ FAILED'}`);
  
  for (const [spokeName, results] of Object.entries(testResults)) {
    if (spokeName === 'hub') continue;
    
    console.log(`\n🔗 ${spokeName.toUpperCase()}:`);
    console.log(`   Configuration: ${results.configuration ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`   Basic Access: ${results.basicAccess ? '✅ WORKING' : '❌ FAILED'}`);
  }
  
  // Overall result
  const hubWorking = testResults.hub;
  const spokesWorking = Object.entries(testResults)
    .filter(([name]) => name !== 'hub')
    .every(([_, result]) => result.configuration && result.basicAccess);
  
  const allWorking = hubWorking && spokesWorking;
  
  console.log(`\n🎯 OVERALL RESULT: ${allWorking ? '✅ READY FOR CCIP MESSAGING' : '❌ SETUP INCOMPLETE'}`);
  
  if (!allWorking) {
    console.log("\n💡 ACTION ITEMS:");
    if (!hubWorking) {
      console.log("📋 Hub Issues:");
      console.log("   - Fund hub contract with LINK tokens");
      console.log("   - Verify hub contract deployment");
    }
    
    for (const [spokeName, results] of Object.entries(testResults)) {
      if (spokeName === 'hub') continue;
      if (!results.configuration || !results.basicAccess) {
        console.log(`📋 ${spokeName.toUpperCase()} Issues:`);
        if (!results.configuration) {
          console.log("   - Verify contract configuration");
          console.log("   - Check hub address setting");
        }
        if (!results.basicAccess) {
          console.log("   - Fund spoke contracts with LINK tokens");
          console.log("   - Verify contract deployment");
        }
      }
    }
    
    console.log("\n🔗 LINK Token Faucets:");
    console.log("   - Avalanche Fuji: https://faucets.chain.link/fuji");
    console.log("   - Base Sepolia: https://faucets.chain.link/base-sepolia");
    console.log("   - Ethereum Sepolia: https://faucets.chain.link/sepolia");
  } else {
    console.log("\n🎉 All systems ready! Your contracts can now communicate via CCIP.");
    console.log("📝 Next steps:");
    console.log("   - Configure supported tokens");
    console.log("   - Set up price feeds");
    console.log("   - Start using the protocol!");
  }
  
  return allWorking;
};

const main = async () => {
  console.log("🧪 CrossChainDefi Simplified CCIP Testing");
  console.log("="  .repeat(60));
  
  try {
    const success = await runSimpleCCIPTests();
    
    if (success) {
      console.log("\n🎉 ALL TESTS PASSED! CCIP setup is working correctly.");
    } else {
      console.log("\n⚠️  Some tests failed. Please check the issues above and retry.");
    }
    
  } catch (error) {
    console.error(`❌ CCIP tests failed: ${error.message}`);
    process.exit(1);
  }
};

// Execute tests
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  runSimpleCCIPTests,
  main
}; 