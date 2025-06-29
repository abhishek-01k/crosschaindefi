// CrossChainDefi Deployment Configuration
// ================================================
// This file contains deployment configurations for all supported networks
// Make sure to create .env file with required environment variables

require('dotenv').config();
const { ethers } = require('hardhat');

// Network-specific Chainlink contract addresses
const CHAINLINK_ADDRESSES = {
  // Avalanche Fuji Testnet
  fuji: {
    router: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
    vrfCoordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610",
    keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61",
    automationRegistry: "0x819B58A646CDd8289275A87653a2aA4902b14fe6",
    chainSelector: "14767482510784806043",
    donId: "fun-avalanche-fuji-1"
  },
  
  // Base Sepolia Testnet
  baseSepolia: {
    router: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    functionsRouter: "0xf9B8fc078197181C841c296C876945aaa425B278",
    vrfCoordinator: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
    keyHash: "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899",
    automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
    chainSelector: "10344971235874465080",
    donId: "fun-base-sepolia-1"
  },
  
  // Ethereum Sepolia Testnet
  sepolia: {
    router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad",
    chainSelector: "16015286601757825753",
    donId: "fun-ethereum-sepolia-1"
  },
  
  // Arbitrum Sepolia Testnet (for future expansion)
  arbitrumSepolia: {
    router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    vrfCoordinator: "0x50d47e4142598E3411aA864e08a44284e471AC6f",
    keyHash: "0x027f94ff1465724369d9b9d9b395a8885dc842a5906d903039d10ceb25e9133a",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad",
    chainSelector: "3478487238524512106",
    donId: "fun-arbitrum-sepolia-1"
  },
  
  // Polygon Mumbai Testnet (for future expansion)
  polygonMumbai: {
    router: "0x1035CabC275068e0F4b745A29CEDf38E13aF41b1",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
    vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2",
    chainSelector: "12532609583862916517",
    donId: "fun-polygon-mumbai-1"
  }
};

// Helper function to safely convert subscription ID to uint256
const safeSubscriptionId = (envVar, fallback = 1) => {
  if (!envVar) return BigInt(fallback);
  
  try {
    const bigIntValue = BigInt(envVar);
    console.log(`✅ Using subscription ID: ${bigIntValue.toString()}`);
    return bigIntValue;
  } catch (error) {
    console.warn(`⚠️  Invalid subscription ID ${envVar}. Using fallback value ${fallback}.`);
    return BigInt(fallback);
  }
};

// Helper function to convert DON ID string to bytes32
const donIdToBytes32 = (donIdString) => {
  return ethers.encodeBytes32String(donIdString);
};

// VRF Configuration
const VRF_CONFIG = {
  fuji: {
    subscriptionId: safeSubscriptionId(process.env.VRF_SUBSCRIPTION_ID_FUJI, 1),
    callbackGasLimit: 100000,
    requestConfirmations: 3,
    numWords: 1
  },
  baseSepolia: {
    subscriptionId: safeSubscriptionId(process.env.VRF_SUBSCRIPTION_ID_BASE_SEPOLIA, 1),
    callbackGasLimit: 100000,
    requestConfirmations: 3,
    numWords: 1
  },
  sepolia: {
    subscriptionId: safeSubscriptionId(process.env.VRF_SUBSCRIPTION_ID_SEPOLIA, 1),
    callbackGasLimit: 100000,
    requestConfirmations: 3,
    numWords: 1
  }
};

// Functions Configuration
const FUNCTIONS_CONFIG = {
  fuji: {
    subscriptionId: safeSubscriptionId(process.env.FUNCTIONS_SUBSCRIPTION_ID_FUJI, 1),
    gasLimit: 300000
  },
  baseSepolia: {
    subscriptionId: safeSubscriptionId(process.env.FUNCTIONS_SUBSCRIPTION_ID_BASE_SEPOLIA, 1),
    gasLimit: 300000
  },
  sepolia: {
    subscriptionId: safeSubscriptionId(process.env.FUNCTIONS_SUBSCRIPTION_ID_SEPOLIA, 1),
    gasLimit: 300000
  }
};

// Protocol Configuration
const PROTOCOL_CONFIG = {
  // Risk Parameters
  LIQUIDATION_THRESHOLD: 80, // 80%
  HEALTH_FACTOR_THRESHOLD: 110, // 110%
  MAX_UTILIZATION_RATE: 90, // 90%
  
  // Fees (in basis points)
  PROTOCOL_FEE: 100, // 1%
  LIQUIDATION_FEE: 500, // 5%
  
  // Limits
  MIN_DEPOSIT_AMOUNT: ethers.parseUnits("1", 6), // $1 minimum
  MAX_DEPOSIT_AMOUNT: ethers.parseUnits("1000000", 18), // $1M maximum
  
  // Timing
  YIELD_COMPOUND_INTERVAL: 86400, // 1 day
  STRATEGY_REBALANCE_INTERVAL: 604800, // 7 days
  
  // Precision
  PRECISION: ethers.parseUnits("1", 18)
};

// Deployment Configuration
const DEPLOYMENT_CONFIG = {
  // Primary deployment networks
  networks: ['fuji', 'baseSepolia', 'sepolia'],
  
  // Hub chain (where main protocol contracts are deployed)
  hubChain: 'fuji',
  
  // Spoke chains (where depositor/minter contracts are deployed)
  spokeChains: ['baseSepolia', 'sepolia'],
  
  // Gas configuration
  gasSettings: {
    gasPrice: undefined, // Let network determine gas price
    gasLimit: 8000000
  },
  
  // Verification delay (seconds)
  verificationDelay: 30,
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 10000 // 10 seconds
};

// Contract deployment order
const DEPLOYMENT_ORDER = [
  'CrossChainDefiHub',
  'CrossChainDepositor', 
  'CrossChainMinter',
  'ArbitrageCoordinatorAgent',
  'MarketIntelligenceAgent'
];

// Export all configurations
module.exports = {
  CHAINLINK_ADDRESSES,
  VRF_CONFIG,
  FUNCTIONS_CONFIG,
  PROTOCOL_CONFIG,
  DEPLOYMENT_CONFIG,
  DEPLOYMENT_ORDER,
  
  // Helper functions
  getChainlinkConfig: (network) => CHAINLINK_ADDRESSES[network],
  getVRFConfig: (network) => VRF_CONFIG[network],
  getFunctionsConfig: (network) => FUNCTIONS_CONFIG[network],
  getDonIdBytes32: (network) => donIdToBytes32(CHAINLINK_ADDRESSES[network].donId),
  
  // Validation functions
  validateNetwork: (network) => {
    if (!CHAINLINK_ADDRESSES[network]) {
      throw new Error(`Network ${network} not supported`);
    }
    return true;
  },
  
  validateEnvironment: () => {
    const required = ['PRIVATE_KEY', 'ALCHEMY_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    return true;
  }
}; 