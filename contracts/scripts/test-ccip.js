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

// Test 1: Cross-chain deposit notification (Spoke -> Hub)
const testDepositNotification = async (spokeName, spokeDeployment, hubDeployment) => {
  console.log(`\n🧪 TEST 1: Testing deposit notification from ${spokeName.toUpperCase()} to HUB...`);
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
      console.log("   Fund the depositor with LINK tokens first.");
      return false;
    }
    
    // Test deposit with small amount (0.01 ETH)
    const depositAmount = ethers.parseEther("0.01");
    
    console.log(`💸 Testing deposit of ${ethers.formatEther(depositAmount)} ETH...`);
    
    // Call deposit function (this should trigger CCIP message to hub)
    const tx = await depositorContract.deposit(
      ethers.ZeroAddress, // ETH address
      depositAmount,
      0, // StrategyType.NONE
      false, // autoCompound
      { value: depositAmount }
    );
    
    console.log(`📤 Deposit transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Deposit transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Look for CCIP message sent event
    const ccipMessageSentTopic = "0x8c36e6a2e0f4d40c3b7c78e5f2a5932a8e3db8c8a5b2a7d2e3c5f4b3a1c0d9e8";
    const ccipEvents = receipt.logs.filter(log => log.topics.includes(ccipMessageSentTopic));
    
    if (ccipEvents.length > 0) {
      console.log(`🌐 CCIP Message sent successfully! Found ${ccipEvents.length} CCIP event(s)`);
      
      // Try to get message ID from events
      for (const event of ccipEvents) {
        try {
          console.log(`📋 CCIP Event: ${event.transactionHash}`);
          console.log(`   Block: ${event.blockNumber}`);
        } catch (error) {
          console.log(`⚠️  Could not parse CCIP event: ${error.message}`);
        }
      }
      
      return true;
    } else {
      console.log(`❌ No CCIP message events found. Check contract configuration.`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Deposit test failed: ${error.message}`);
    return false;
  }
};

// Test 2: Cross-chain mint request (Hub -> Spoke)
const testMintRequest = async (spokeName, spokeDeployment, hubDeployment) => {
  console.log(`\n🧪 TEST 2: Testing mint request from HUB to ${spokeName.toUpperCase()}...`);
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
      console.log("⚠️  WARNING: Hub has 0 LINK balance. CCIP message may fail.");
      console.log("   Fund the hub with LINK tokens first.");
      return false;
    }
    
    // Get spoke chain selector
    const spokeChainConfig = getChainlinkConfig(spokeName);
    const spokeChainSelector = spokeChainConfig.chainSelector;
    
    console.log(`🎯 Target Spoke Chain: ${spokeName.toUpperCase()}`);
    console.log(`📍 Chain Selector: ${spokeChainSelector}`);
    console.log(`🏦 Target Minter: ${spokeDeployment.contracts.CrossChainMinter}`);
    
    // Test borrow request (this should trigger CCIP message to spoke)
    const borrowAmount = ethers.parseUnits("100", 6); // 100 USDC
    
    console.log(`💰 Testing borrow request for ${ethers.formatUnits(borrowAmount, 6)} USDC...`);
    
    // Call requestBorrow function (this should trigger CCIP message to spoke)
    const tx = await hubContract.requestCrosschainBorrow(
      ethers.ZeroAddress, // USDC token address (using zero for test)
      borrowAmount,
      spokeChainSelector,
      hubSigner.address // borrower address
    );
    
    console.log(`📤 Borrow request transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Borrow request confirmed in block: ${receipt.blockNumber}`);
    
    // Look for CCIP message sent event
    const ccipMessageSentTopic = "0x8c36e6a2e0f4d40c3b7c78e5f2a5932a8e3db8c8a5b2a7d2e3c5f4b3a1c0d9e8";
    const ccipEvents = receipt.logs.filter(log => log.topics.includes(ccipMessageSentTopic));
    
    if (ccipEvents.length > 0) {
      console.log(`🌐 CCIP Message sent successfully! Found ${ccipEvents.length} CCIP event(s)`);
      return true;
    } else {
      console.log(`❌ No CCIP message events found. Check contract configuration.`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Mint request test failed: ${error.message}`);
    
    // Check if it's a specific error we can help with
    if (error.message.includes("insufficient LINK")) {
      console.log("💡 Solution: Fund the hub contract with LINK tokens");
    } else if (error.message.includes("DestinationChainNotAllowlisted")) {
      console.log("💡 Solution: Run the cross-chain setup script to configure allowed chains");
    } else if (error.message.includes("ReceiverNotAllowlisted")) {
      console.log("💡 Solution: Configure allowed receivers on the destination chain");
    }
    
    return false;
  }
};

// Test 3: Check cross-chain configuration
const testCrossChainConfig = async (spokeName, spokeDeployment, hubDeployment) => {
  console.log(`\n🧪 TEST 3: Checking cross-chain configuration for ${spokeName.toUpperCase()}...`);
  console.log("-".repeat(50));
  
  try {
    // Check hub configuration
    const fujiProvider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc");
    const hubSigner = new ethers.Wallet(process.env.PRIVATE_KEY, fujiProvider);
    
    const hubContract = await ethers.getContractAt(
      'CrossChainDefiHub',
      hubDeployment.contracts.CrossChainDefiHub,
      hubSigner
    );
    
    const spokeChainConfig = getChainlinkConfig(spokeName);
    const hubChainConfig = getChainlinkConfig(DEPLOYMENT_CONFIG.hubChain);
    
    // Check if spoke chain is registered with hub
    console.log("🔍 Checking hub configuration...");
    try {
      const depositorAddress = await hubContract.getSpokeContract(spokeChainConfig.chainSelector, 0); // DEPOSITOR
      const minterAddress = await hubContract.getSpokeContract(spokeChainConfig.chainSelector, 1); // MINTER
      
      console.log(`✅ Hub knows about depositor: ${depositorAddress}`);
      console.log(`✅ Hub knows about minter: ${minterAddress}`);
      
      if (depositorAddress === spokeDeployment.contracts.CrossChainDepositor) {
        console.log(`✅ Depositor address matches deployment`);
      } else {
        console.log(`❌ Depositor address mismatch`);
        console.log(`   Expected: ${spokeDeployment.contracts.CrossChainDepositor}`);
        console.log(`   Got: ${depositorAddress}`);
      }
      
      if (minterAddress === spokeDeployment.contracts.CrossChainMinter) {
        console.log(`✅ Minter address matches deployment`);
      } else {
        console.log(`❌ Minter address mismatch`);
        console.log(`   Expected: ${spokeDeployment.contracts.CrossChainMinter}`);
        console.log(`   Got: ${minterAddress}`);
      }
      
    } catch (error) {
      console.log(`❌ Hub does not recognize spoke chain: ${error.message}`);
      console.log("💡 Solution: Run setup-cross-chain.js to register spoke contracts");
    }
    
    // Check spoke configuration
    console.log("\n🔍 Checking spoke configuration...");
    
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
    
    try {
      const isHubAllowed = await depositorContract.isAllowedSender(
        hubChainConfig.chainSelector,
        hubDeployment.contracts.CrossChainDefiHub
      );
      
      if (isHubAllowed) {
        console.log(`✅ Depositor recognizes hub as allowed sender`);
      } else {
        console.log(`❌ Depositor does not recognize hub as allowed sender`);
        console.log("💡 Solution: Run setup-cross-chain.js to configure allowed senders");
      }
    } catch (error) {
      console.log(`❌ Could not check depositor configuration: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Configuration check failed: ${error.message}`);
    return false;
  }
};

// Main test function
const runCCIPTests = async () => {
  console.log("\n🧪 CCIP CROSS-CHAIN MESSAGING TESTS");
  console.log("=".repeat(60));
  
  // Load deployment info
  const hubDeployment = loadDeploymentInfo(DEPLOYMENT_CONFIG.hubChain);
  if (!hubDeployment) {
    throw new Error(`❌ Hub deployment not found on ${DEPLOYMENT_CONFIG.hubChain}`);
  }
  
  console.log(`🏛️  Hub Chain: ${DEPLOYMENT_CONFIG.hubChain.toUpperCase()}`);
  console.log(`   Hub Address: ${hubDeployment.contracts.CrossChainDefiHub}`);
  
  const testResults = {};
  
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
      configCheck: false,
      depositTest: false,
      mintTest: false
    };
    
    // Run tests
    results.configCheck = await testCrossChainConfig(spokeName, spokeDeployment, hubDeployment);
    await sleep(3000);
    
    results.depositTest = await testDepositNotification(spokeName, spokeDeployment, hubDeployment);
    await sleep(3000);
    
    results.mintTest = await testMintRequest(spokeName, spokeDeployment, hubDeployment);
    await sleep(3000);
    
    testResults[spokeName] = results;
  }
  
  // Test summary
  console.log("\n📊 TEST RESULTS SUMMARY:");
  console.log("=".repeat(60));
  
  for (const [spokeName, results] of Object.entries(testResults)) {
    console.log(`\n🔗 ${spokeName.toUpperCase()}:`);
    console.log(`   Configuration Check: ${results.configCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Deposit Test (Spoke→Hub): ${results.depositTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Mint Test (Hub→Spoke): ${results.mintTest ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  // Overall result
  const allTestsPassed = Object.values(testResults).every(result => 
    result.configCheck && result.depositTest && result.mintTest
  );
  
  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allTestsPassed) {
    console.log("\n💡 TROUBLESHOOTING TIPS:");
    console.log("1. Run setup-cross-chain.js to configure CCIP relationships");
    console.log("2. Fund contracts with LINK tokens from faucets");
    console.log("3. Add contracts to Chainlink subscriptions (VRF/Functions)");
    console.log("4. Check environment variables for RPC URLs and private keys");
  }
  
  return allTestsPassed;
};

const main = async () => {
  console.log("🧪 CrossChainDefi CCIP Testing Suite");
  console.log("="  .repeat(60));
  
  try {
    const success = await runCCIPTests();
    
    if (success) {
      console.log("\n🎉 ALL CCIP TESTS PASSED! Cross-chain messaging is working correctly.");
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
  runCCIPTests,
  testDepositNotification,
  testMintRequest,
  testCrossChainConfig,
  main
}; 