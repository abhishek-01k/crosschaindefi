require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const {
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  ARBISCAN_API_KEY,
  OPTIMISTIC_ETHERSCAN_API_KEY,
  BASESCAN_API_KEY,
  SNOWTRACE_API_KEY,
  BSCSCAN_API_KEY,
  ALCHEMY_API_KEY,
  INFURA_API_KEY,
  COINMARKETCAP_API_KEY,
  FANTOM_RPC_URL,
  CELO_RPC_URL,
  GNOSIS_RPC_URL,
  LINEA_RPC_URL,
  ZKSYNC_RPC_URL,
  MANTLE_RPC_URL,
  SCROLL_RPC_URL
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 18500000,
      },
    },
    // Ethereum Networks
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: "auto",
      verify: {
        etherscan: {
          apiKey: ETHERSCAN_API_KEY,
        },
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
    },
    // Polygon Networks
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto",
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: "auto",
    },
    // Arbitrum Networks
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 42161,
      gasPrice: "auto",
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 421614,
      gasPrice: "auto",
    },
    // Optimism Networks
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 10,
      gasPrice: "auto",
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155420,
      gasPrice: "auto",
    },
    // Base Networks
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: "auto",
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: "auto",
    },
    // Avalanche Networks
    avalanche: {
      url: "https://rpc.owlracle.info/avax/70d38ce1826c4a60bb2a8e05a6c8b20f",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 43114,
      gasPrice: "auto",
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 43113,
    },
    // BSC Networks
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: "auto",
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: "auto",
    },
    // Fantom Networks (Chainlink VRF, Functions supported)
    fantom: {
      url: FANTOM_RPC_URL || "https://rpc.fantom.network",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 250,
      gasPrice: "auto",
    },
    fantomTestnet: {
      url: "https://rpc.testnet.fantom.network",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 4002,
      gasPrice: "auto",
    },
    // Celo Networks (Chainlink Functions supported)
    celo: {
      url: CELO_RPC_URL || "https://forno.celo.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 42220,
      gasPrice: "auto",
    },
    celoAlfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 44787,
      gasPrice: "auto",
    },
    // Gnosis Chain (xDai)
    gnosis: {
      url: GNOSIS_RPC_URL || "https://rpc.gnosischain.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 100,
      gasPrice: "auto",
    },
    // Linea Networks
    linea: {
      url: LINEA_RPC_URL || "https://rpc.linea.build",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59144,
      gasPrice: "auto",
    },
    lineaTestnet: {
      url: "https://rpc.goerli.linea.build",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59140,
      gasPrice: "auto",
    },
    // Mantle Network
    mantle: {
      url: MANTLE_RPC_URL || "https://rpc.mantle.xyz",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5000,
      gasPrice: "auto",
    },
    // Scroll Network
    scroll: {
      url: SCROLL_RPC_URL || "https://rpc.scroll.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 534352,
      gasPrice: "auto",
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 534351,
      gasPrice: "auto",
    },
    // zkSync Era Network
    zkSyncEra: {
      url: ZKSYNC_RPC_URL || "https://mainnet.era.zksync.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 324,
      gasPrice: "auto",
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 280,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      arbitrumSepolia: ARBISCAN_API_KEY,
      optimisticEthereum: OPTIMISTIC_ETHERSCAN_API_KEY,
      optimisticSepolia: OPTIMISTIC_ETHERSCAN_API_KEY,
      base: BASESCAN_API_KEY,
      baseSepolia: BASESCAN_API_KEY,
      avalanche: SNOWTRACE_API_KEY,
      avalancheFujiTestnet: SNOWTRACE_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      fantom: process.env.FTMSCAN_API_KEY || "DUMMY_KEY",
      fantomTestnet: process.env.FTMSCAN_API_KEY || "DUMMY_KEY",
      celo: process.env.CELOSCAN_API_KEY || "DUMMY_KEY",
      celoAlfajores: process.env.CELOSCAN_API_KEY || "DUMMY_KEY",
      gnosis: process.env.GNOSISSCAN_API_KEY || "DUMMY_KEY",
      linea: process.env.LINEASCAN_API_KEY || "DUMMY_KEY",
      lineaTestnet: process.env.LINEASCAN_API_KEY || "DUMMY_KEY",
      mantle: process.env.MANTLESCAN_API_KEY || "DUMMY_KEY",
      scroll: process.env.SCROLLSCAN_API_KEY || "DUMMY_KEY",
      scrollSepolia: process.env.SCROLLSCAN_API_KEY || "DUMMY_KEY",
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimism.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "fantom",
        chainId: 250,
        urls: {
          apiURL: "https://api.ftmscan.com/api",
          browserURL: "https://ftmscan.com/",
        },
      },
      {
        network: "fantomTestnet",
        chainId: 4002,
        urls: {
          apiURL: "https://api-testnet.ftmscan.com/api",
          browserURL: "https://testnet.ftmscan.com/",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/",
        },
      },
      {
        network: "celoAlfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io/",
        },
      },
      {
        network: "gnosis",
        chainId: 100,
        urls: {
          apiURL: "https://api.gnosisscan.io/api",
          browserURL: "https://gnosisscan.io/",
        },
      },
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/",
        },
      },
      {
        network: "lineaTestnet",
        chainId: 59140,
        urls: {
          apiURL: "https://api-testnet.lineascan.build/api",
          browserURL: "https://goerli.lineascan.build/",
        },
      },
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz/",
        },
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com/",
        },
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com/",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 21,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
    strict: true,
    only: [
      "CrossChainDefiHub",
      "CrossChainDepositor", 
      "CrossChainMinter",
      "ArbitrageCoordinatorAgent",
      "MarketIntelligenceAgent",
    ],
  },
  mocha: {
    timeout: 300000, // 5 minutes
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [
      "CrossChainDefiHub",
      "CrossChainDepositor",
      "CrossChainMinter", 
      "ArbitrageCoordinatorAgent",
      "MarketIntelligenceAgent",
    ],
    spacing: 2,
    pretty: true,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
}; 