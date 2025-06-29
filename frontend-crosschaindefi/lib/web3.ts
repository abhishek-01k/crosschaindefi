import { createConfig, http } from 'wagmi'
import { 
  mainnet, 
  polygon, 
  arbitrum, 
  optimism, 
  base, 
  avalanche, 
  bsc,
  sepolia,
  baseSepolia,
  avalancheFuji,
  polygonMumbai,
  arbitrumSepolia
} from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { createPublicClient } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Supported chains for CrossChainDefi (including testnets)
export const supportedChains = [
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumSepolia,
  optimism,
  base,
  baseSepolia,
  avalanche,
  avalancheFuji,
  bsc,
] as const

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set')
}

// Create Wagmi config with testnets for development
export const wagmiConfig = getDefaultConfig({
  appName: 'CrossChainDefi',
  projectId: projectId ?? '',
  chains: [
    avalancheFuji,
    baseSepolia,
    sepolia,
    polygonMumbai,
    arbitrumSepolia,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    avalanche
  ],
  ssr: true,
});

// Chain configurations for easy access
export const chainConfigs = {
  [mainnet.id]: {
    name: 'Ethereum',
    logo: '⟠',
    color: 'bg-blue-500',
    explorer: 'https://etherscan.io',
    isTestnet: false,
  },
  [sepolia.id]: {
    name: 'Sepolia',
    logo: '⟠',
    color: 'bg-blue-400',
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
  [polygon.id]: {
    name: 'Polygon',
    logo: '⬟',
    color: 'bg-purple-500',
    explorer: 'https://polygonscan.com',
    isTestnet: false,
  },
  [polygonMumbai.id]: {
    name: 'Mumbai',
    logo: '⬟',
    color: 'bg-purple-400',
    explorer: 'https://mumbai.polygonscan.com',
    isTestnet: true,
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    logo: '◆',
    color: 'bg-cyan-500',
    explorer: 'https://arbiscan.io',
    isTestnet: false,
  },
  [arbitrumSepolia.id]: {
    name: 'Arbitrum Sepolia',
    logo: '◆',
    color: 'bg-cyan-400',
    explorer: 'https://sepolia.arbiscan.io',
    isTestnet: true,
  },
  [optimism.id]: {
    name: 'Optimism',
    logo: '🔴',
    color: 'bg-red-500',
    explorer: 'https://optimistic.etherscan.io',
    isTestnet: false,
  },
  [base.id]: {
    name: 'Base',
    logo: '🔵',
    color: 'bg-blue-600',
    explorer: 'https://basescan.org',
    isTestnet: false,
  },
  [baseSepolia.id]: {
    name: 'Base Sepolia',
    logo: '🔵',
    color: 'bg-blue-400',
    explorer: 'https://sepolia.basescan.org',
    isTestnet: true,
  },
  [avalanche.id]: {
    name: 'Avalanche',
    logo: '🔺',
    color: 'bg-red-600',
    explorer: 'https://snowtrace.io',
    isTestnet: false,
  },
  [avalancheFuji.id]: {
    name: 'Fuji',
    logo: '🔺',
    color: 'bg-red-400',
    explorer: 'https://testnet.snowtrace.io',
    isTestnet: true,
  },
  [bsc.id]: {
    name: 'BSC',
    logo: '🟡',
    color: 'bg-yellow-500',
    explorer: 'https://bscscan.com',
    isTestnet: false,
  },
} as const

// Helper functions
export function getChainConfig(chainId: number) {
  return chainConfigs[chainId as keyof typeof chainConfigs]
}

export function isChainSupported(chainId: number) {
  return chainId in chainConfigs
}

export function isTestnet(chainId: number) {
  const config = getChainConfig(chainId)
  return config?.isTestnet ?? false
}

// Public clients for each chain
export const publicClients = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL),
  }),
  [sepolia.id]: createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  }),
  [polygon.id]: createPublicClient({
    chain: polygon,
    transport: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL),
  }),
  [polygonMumbai.id]: createPublicClient({
    chain: polygonMumbai,
    transport: http(process.env.NEXT_PUBLIC_MUMBAI_RPC_URL),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  }),
  [arbitrumSepolia.id]: createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
  }),
  [optimism.id]: createPublicClient({
    chain: optimism,
    transport: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
  }),
  [base.id]: createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  }),
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  }),
  [avalanche.id]: createPublicClient({
    chain: avalanche,
    transport: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL),
  }),
  [avalancheFuji.id]: createPublicClient({
    chain: avalancheFuji,
    transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
  }),
  [bsc.id]: createPublicClient({
    chain: bsc,
    transport: http(process.env.NEXT_PUBLIC_BSC_RPC_URL),
  }),
}

// CrossChainDefi Protocol Contract Addresses
export const protocolContracts = {
  // Hub Chain (Avalanche Fuji) - All contracts deployed
  [avalancheFuji.id]: {
    crossChainDefiHub: '0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab',
    crossChainDepositor: '0x56Ece20263898124295378c5b8EEf367fE3AC76F',
    crossChainMinter: '0x51d328e6F439eaE6f2BEc120F6F6313fbf50119A',
    arbitrageCoordinatorAgent: '0xD103937FEaf0DF4c8ADD4fe28Cfc7830B66DF919',
    marketIntelligenceAgent: '0xB7F02024F2B8F3050440D2191f290eF635236520',
    isHub: true,
  },
  // Base Sepolia - Spoke chain contracts
  [baseSepolia.id]: {
    crossChainDepositor: '0x2c58f9388470Cef9C163d40470BDcE62C0d9888e',
    crossChainMinter: '0xB16c17578917fac80fEA345ee76021204cd07C34',
    isHub: false,
  },
  // Sepolia - Ready for deployment
  [sepolia.id]: {
    // Contracts will be deployed here
    isHub: false,
  },
} as const

// Token addresses for major tokens on each chain
export const tokenAddresses = {
  [mainnet.id]: {
    USDC: '0xA0b86a33E7A9d27b3b7d8673c0f0A96e5D7C8E89',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  },
  [sepolia.id]: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    LINK: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  },
  [polygon.id]: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    LINK: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
  },
  [polygonMumbai.id]: {
    USDC: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97',
    USDT: '0xBD21A10F619BE90d6066c941b04e4B3b9b3b76A0',
    DAI: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F',
    WMATIC: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    LINK: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
  },
  [arbitrum.id]: {
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
  },
  [arbitrumSepolia.id]: {
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    USDT: '0x8d1cC5d12B4b1A0909Cd93A34C41DC1d9FD24c3',
    DAI: '0x0Bf7e3EFbE6C6C5f5f6F5D15E6B5E5e5E5E5E5e5',
    WETH: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    LINK: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
  },
  [optimism.id]: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x4200000000000000000000000000000000000006',
    LINK: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
  },
  [base.id]: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    WETH: '0x4200000000000000000000000000000000000006',
    LINK: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
  },
  [baseSepolia.id]: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    WETH: '0x4200000000000000000000000000000000000006',
    LINK: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
  },
  [avalanche.id]: {
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    LINK: '0x5947BB275c521040051D82396192181b413227A3',
  },
  [avalancheFuji.id]: {
    USDC: '0x5425890298aed601595a70AB815c96711a31Bc65',
    USDT: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3',
    WAVAX: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
    LINK: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
  },
  [bsc.id]: {
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    LINK: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
  },
} as const

// Supported token list for UI
export const supportedTokens = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  { symbol: 'LINK', name: 'Chainlink', decimals: 18 },
  { symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18 },
  { symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18 },
  { symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18 },
] as const

export type SupportedChainId = typeof supportedChains[number]['id']
export type TokenSymbol = keyof typeof tokenAddresses[SupportedChainId]
export type ProtocolContract = keyof typeof protocolContracts[SupportedChainId]

// Helper functions for protocol
export function getProtocolContracts(chainId: number) {
  const contracts = (protocolContracts as Record<number, any>)[chainId]
  return contracts || null
}

export function isHubChain(chainId: number) {
  const contracts = getProtocolContracts(chainId)
  return contracts?.isHub ?? false
}

export function getTokenAddress(chainId: number, symbol: string) {
  const tokens = tokenAddresses[chainId as keyof typeof tokenAddresses]
  return tokens?.[symbol as keyof typeof tokens]
}

export function getTokenByAddress(chainId: number, address: string) {
  const tokens = tokenAddresses[chainId as keyof typeof tokenAddresses]
  if (!tokens) return null
  
  for (const [symbol, tokenAddress] of Object.entries(tokens)) {
    if (tokenAddress.toLowerCase() === address.toLowerCase()) {
      return supportedTokens.find(t => t.symbol === symbol)
    }
  }
  return null
}