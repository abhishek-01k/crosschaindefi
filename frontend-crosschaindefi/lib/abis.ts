// Contract ABIs for CrossChainDefi Protocol
export const CrossChainDefiHubABI = [
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "destinationChain", "type": "uint64" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "repay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "name": "getUserProfile",
    "outputs": [
      { "name": "healthFactor", "type": "uint256" },
      { "name": "creditScore", "type": "uint256" },
      { "name": "lastActivity", "type": "uint256" },
      { "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "name": "getUserDeposits",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "name": "getUserBorrowed",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProtocolStats",
    "outputs": [
      { "name": "_totalDeposits", "type": "uint256" },
      { "name": "_totalBorrowed", "type": "uint256" },
      { "name": "_protocolFees", "type": "uint256" },
      { "name": "utilizationRate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "chainSelector", "type": "uint64" }
    ],
    "name": "UserDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "healthFactor", "type": "uint256" }
    ],
    "name": "UserBorrow",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "oldHealthFactor", "type": "uint256" },
      { "indexed": false, "name": "newHealthFactor", "type": "uint256" }
    ],
    "name": "HealthFactorUpdated",
    "type": "event"
  }
] as const

export const CrossChainDepositorABI = [
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "strategy", "type": "uint8" },
      { "name": "enableAutoCompound", "type": "bool" }
    ],
    "name": "deposit",
    "outputs": [
      { "name": "depositId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" }
    ],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "depositId", "type": "bytes32" }
    ],
    "name": "getDepositInfo",
    "outputs": [
      {
        "components": [
          { "name": "user", "type": "address" },
          { "name": "token", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "destinationChain", "type": "uint64" },
          { "name": "timestamp", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "ccipMessageId", "type": "bytes32" },
          { "name": "yieldEarned", "type": "uint256" },
          { "name": "strategy", "type": "uint8" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "name": "getUserProfile",
    "outputs": [
      { "name": "totalDeposited", "type": "uint256" },
      { "name": "totalYieldEarned", "type": "uint256" },
      { "name": "depositCount", "type": "uint256" },
      { "name": "lastDepositTime", "type": "uint256" },
      { "name": "riskTolerance", "type": "uint256" },
      { "name": "autoYieldEnabled", "type": "bool" },
      { "name": "preferredStrategy", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "name": "getUserTokenBalance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "name": "getUserYieldBalance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProtocolStats",
    "outputs": [
      { "name": "_totalValueLocked", "type": "uint256" },
      { "name": "_totalYieldGenerated", "type": "uint256" },
      { "name": "_totalDepositsCount", "type": "uint256" },
      { "name": "_protocolFees", "type": "uint256" },
      { "name": "_supportedTokensCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const CrossChainMinterABI = [
  {
    "inputs": [
      { "name": "collateralToken", "type": "address" },
      { "name": "collateralAmount", "type": "uint256" },
      { "name": "mintAmount", "type": "uint256" }
    ],
    "name": "requestMint",
    "outputs": [
      { "name": "requestId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "burnAmount", "type": "uint256" },
      { "name": "collateralToken", "type": "address" },
      { "name": "collateralAmount", "type": "uint256" }
    ],
    "name": "requestBurn",
    "outputs": [
      { "name": "requestId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "name": "getUserPosition",
    "outputs": [
      { "name": "totalMinted", "type": "uint256" },
      { "name": "lastUpdateTime", "type": "uint256" },
      { "name": "healthFactor", "type": "uint256" },
      { "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "name": "getUserCollateralBalance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "collateralToken", "type": "address" },
      { "name": "collateralAmount", "type": "uint256" }
    ],
    "name": "calculateMaxMintAmount",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "name": "isPositionHealthy",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProtocolStats",
    "outputs": [
      { "name": "_totalSupplyMinted", "type": "uint256" },
      { "name": "_totalCollateralValue", "type": "uint256" },
      { "name": "_protocolFees", "type": "uint256" },
      { "name": "_stabilityPoolBalance", "type": "uint256" },
      { "name": "collateralizationRatio", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const ArbitrageCoordinatorAgentABI = [
  {
    "inputs": [
      { "name": "tokenA", "type": "address" },
      { "name": "tokenB", "type": "address" },
      { "name": "sourceChain", "type": "uint64" },
      { "name": "destinationChain", "type": "uint64" }
    ],
    "name": "detectArbitrageOpportunity",
    "outputs": [
      { "name": "opportunityId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "opportunityId", "type": "bytes32" }
    ],
    "name": "getOpportunity",
    "outputs": [
      {
        "components": [
          { "name": "tokenA", "type": "address" },
          { "name": "tokenB", "type": "address" },
          { "name": "sourceChain", "type": "uint64" },
          { "name": "destinationChain", "type": "uint64" },
          { "name": "sourcePrice", "type": "uint256" },
          { "name": "destinationPrice", "type": "uint256" },
          { "name": "profitPercentage", "type": "uint256" },
          { "name": "maxAmount", "type": "uint256" },
          { "name": "timestamp", "type": "uint256" },
          { "name": "isActive", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveOpportunities",
    "outputs": [
      { "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAgentStats",
    "outputs": [
      { "name": "_totalVolume", "type": "uint256" },
      { "name": "_totalProfit", "type": "uint256" },
      { "name": "_successfulExecutions", "type": "uint256" },
      { "name": "_failedExecutions", "type": "uint256" },
      { "name": "_successRate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const MarketIntelligenceAgentABI = [
  {
    "inputs": [
      { "name": "protocol", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "chainSelector", "type": "uint64" }
    ],
    "name": "requestLendingMarketAnalysis",
    "outputs": [
      { "name": "requestId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "duration", "type": "uint256" }
    ],
    "name": "detectYieldOpportunities",
    "outputs": [
      { "name": "foundOpportunities", "type": "bytes32[]" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" }
    ],
    "name": "getBestRatesForToken",
    "outputs": [
      { "name": "bestSupplyRate", "type": "uint256" },
      { "name": "bestBorrowRate", "type": "uint256" },
      { "name": "bestSupplyProtocol", "type": "address" },
      { "name": "bestBorrowProtocol", "type": "address" },
      { "name": "bestSupplyChain", "type": "uint64" },
      { "name": "bestBorrowChain", "type": "uint64" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveOpportunities",
    "outputs": [
      { "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAgentStats",
    "outputs": [
      { "name": "_totalAnalyses", "type": "uint256" },
      { "name": "_totalOpportunities", "type": "uint256" },
      { "name": "_totalProtocols", "type": "uint256" },
      { "name": "_analysisAccuracy", "type": "uint256" },
      { "name": "_trackedTokens", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// ERC20 ABI for token interactions
export const ERC20ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Strategy Types
export enum StrategyType {
  CONSERVATIVE = 0,
  BALANCED = 1,
  AGGRESSIVE = 2,
  CUSTOM = 3,
  AUTO_OPTIMIZED = 4
}

// Deposit Status
export enum DepositStatus {
  PENDING = 0,
  PROCESSING = 1,
  SENT_TO_HUB = 2,
  CONFIRMED = 3,
  FAILED = 4
}

// Mint Status  
export enum MintStatus {
  PENDING = 0,
  PROCESSING = 1,
  COMPLETED = 2,
  FAILED = 3,
  EXPIRED = 4
}

// Burn Status
export enum BurnStatus {
  PENDING = 0,
  PROCESSING = 1,
  COMPLETED = 2,
  FAILED = 3,
  EXPIRED = 4
} 