import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, avalanche, bsc } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { createPublicClient } from 'viem'

// Supported chains for CrossChainDefi
export const supportedChains = [
  mainnet,
  polygon, 
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
] as const

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set')
}

// Configure connectors
const connectors = [
  injected(),
  metaMask(),
  ...(projectId ? [walletConnect({ projectId })] : []),
  coinbaseWallet({ appName: 'CrossChainDefi' }),
]

// Create Wagmi config
export const config = createConfig({
  chains: supportedChains,
  connectors,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [avalanche.id]: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL),
  },
  ssr: true,
})

// Chain configurations for easy access
export const chainConfigs = {
  [mainnet.id]: {
    name: 'Ethereum',
    logo: '⟠',
    color: 'bg-blue-500',
    explorer: 'https://etherscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    logo: '⬟',
    color: 'bg-purple-500',
    explorer: 'https://polygonscan.com',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    logo: '◆',
    color: 'bg-cyan-500',
    explorer: 'https://arbiscan.io',
  },
  [optimism.id]: {
    name: 'Optimism',
    logo: '🔴',
    color: 'bg-red-500',
    explorer: 'https://optimistic.etherscan.io',
  },
  [base.id]: {
    name: 'Base',
    logo: '🔵',
    color: 'bg-blue-600',
    explorer: 'https://basescan.org',
  },
  [avalanche.id]: {
    name: 'Avalanche',
    logo: '🔺',
    color: 'bg-red-600',
    explorer: 'https://snowtrace.io',
  },
  [bsc.id]: {
    name: 'BSC',
    logo: '🟡',
    color: 'bg-yellow-500',
    explorer: 'https://bscscan.com',
  },
} as const

// Helper functions
export function getChainConfig(chainId: number) {
  return chainConfigs[chainId as keyof typeof chainConfigs]
}

export function isChainSupported(chainId: number) {
  return chainId in chainConfigs
}

// Public clients for each chain
export const publicClients = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL),
  }),
  [polygon.id]: createPublicClient({
    chain: polygon,
    transport: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL),
  }),
  [arbitrum.id]: createPublicClient({
    chain: arbitrum,
    transport: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
  }),
  [optimism.id]: createPublicClient({
    chain: optimism,
    transport: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL),
  }),
  [base.id]: createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  }),
  [avalanche.id]: createPublicClient({
    chain: avalanche,
    transport: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL),
  }),
  [bsc.id]: createPublicClient({
    chain: bsc,
    transport: http(process.env.NEXT_PUBLIC_BSC_RPC_URL),
  }),
}

// Chainlink contract addresses for each supported network
export const chainlinkContracts = {
  [mainnet.id]: {
    ccipRouter: '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D',
    linkToken: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    vrfCoordinator: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
    automationRegistry: '0x6593c7De001fC8542bB1703532EE1E5aA0D458fD',
    functionsRouter: '0x65C939BB59B332beBf3E9F0B21e8cBFD6D0B7b6F',
  },
  [polygon.id]: {
    ccipRouter: '0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe',
    linkToken: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
    vrfCoordinator: '0xAE975071Be8F8eE67addBC1A82488F1C24858067',
    automationRegistry: '0x08a8eea76D2395807Ce7D1FC942382515469cCA1',
    functionsRouter: '0xdc2AAF042Aeff2E68B3e8E33F19e4B9fA7C73F10',
  },
  [arbitrum.id]: {
    ccipRouter: '0x141fa059441E0ca23ce184B6A78bafD2A517DdE8',
    linkToken: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    vrfCoordinator: '0x41034678D6C633D8a95c75e1138A360a28bA15d1',
    automationRegistry: '0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad',
    functionsRouter: '0x97083E831F8F0638855e2A515c90EdCF158DF238',
  },
  [optimism.id]: {
    ccipRouter: '0x3206695CaE29952f4b0c22a169725a865bc8Ce0f',
    linkToken: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
    automationRegistry: '0x75c0530885F385721fddA23C539AF3701d6183D4',
    functionsRouter: '0x83b7B9b95Fd0B7b1dD6e1f4e3E2B7e0D7C2E1F8C',
  },
  [base.id]: {
    ccipRouter: '0x881e3A65B4d4a04dD529061dd0071cf975F58bCD',
    linkToken: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
    vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
    automationRegistry: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
    functionsRouter: '0xf9B8fc078197181C841c296C876945aaa425B278',
  },
  [avalanche.id]: {
    ccipRouter: '0xF89e3C6F1B24c9446E9E8f8c165f5eCb3e93a6Ea',
    linkToken: '0x5947BB275c521040051D82396192181b413227A3',
    vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
    automationRegistry: '0x7FA5d4E68Bb6de87Ff33334B2C997b7b11B3Ba77',
    functionsRouter: '0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0',
  },
  [bsc.id]: {
    ccipRouter: '0x536d7E53D0aDeB1F20E7c81fea45d02eC9dBD698',
    linkToken: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
    vrfCoordinator: '0xc587d9053cd1118f25F645F9E08BB98c9712A4EE',
    automationRegistry: '0x02777053d6764996e594c3E88AF1D58D5363a2e6',
    functionsRouter: '0x357a5e19b7516757d5c6b75ba85b8df1e38e6e67',
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
  [polygon.id]: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    LINK: '0xb0897686c545045aFc77CF20eC7A532E3120E0F1',
  },
  [arbitrum.id]: {
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
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
    WETH: '0x4200000000000000000000000000000000000006',
    LINK: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
  },
  [avalanche.id]: {
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    LINK: '0x5947BB275c521040051D82396192181b413227A3',
  },
  [bsc.id]: {
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    LINK: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
  },
} as const

export type SupportedChainId = typeof supportedChains[number]['id']
export type TokenSymbol = keyof typeof tokenAddresses[SupportedChainId]

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 