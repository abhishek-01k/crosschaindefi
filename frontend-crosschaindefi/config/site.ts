export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "CrossChainDefi",
  description:
    "The premier cross-chain DeFi lending and borrowing platform. Earn competitive yields and access liquidity across 8+ blockchain networks with Chainlink-powered security.",
  tagline: "The Future of Cross-Chain DeFi",
  version: "1.0.0",
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
  ],
  features: [
    {
      title: "AI-Powered Arbitrage",
      description: "Autonomous agents detect and execute arbitrage opportunities across chains",
      icon: "Bot",
    },
    {
      title: "Cross-Chain Bridge",
      description: "Seamlessly transfer assets using Chainlink CCIP with guaranteed security",
      icon: "Bridge",
    },
    {
      title: "Prediction Markets",
      description: "Trade on real-world events with Polymarket integration and market intelligence",
      icon: "TrendingUp",
    },
    {
      title: "Data Streams",
      description: "Access high-frequency market data with Chainlink's low-latency feeds",
      icon: "Activity",
    },
    {
      title: "VRF Randomization",
      description: "Verifiable randomness for strategy diversification and fair market making",
      icon: "Shuffle",
    },
    {
      title: "Automated Functions",
      description: "Serverless AI computations powered by Chainlink Functions",
      icon: "Cog",
    },
  ],
  agents: [
    {
      name: "Arbitrage Coordinator",
      description: "Orchestrates cross-chain arbitrage opportunities",
      status: "active",
      performance: "+23.4%",
    },
    {
      name: "Market Intelligence",
      description: "Analyzes prediction markets and generates insights",
      status: "active", 
      performance: "+18.7%",
    },
    {
      name: "Cross-Chain Bridge",
      description: "Manages CCIP transactions and liquidity",
      status: "active",
      performance: "+31.2%",
    },
    {
      name: "AI Computation",
      description: "Executes ML computations via Chainlink Functions",
      status: "active",
      performance: "+15.9%",
    },
    {
      name: "Automation",
      description: "Manages automated job execution and scheduling",
      status: "active",
      performance: "+27.1%",
    },
    {
      name: "Randomization", 
      description: "Provides verifiable randomness for strategy optimization",
      status: "active",
      performance: "+12.3%",
    },
    {
      name: "Treasury",
      description: "Manages multi-chain portfolio and risk assessment",
      status: "active",
      performance: "+21.8%",
    },
  ],
  supportedChains: [
    "Ethereum",
    "Polygon",
    "Arbitrum",
    "Optimism",
    "Base",
    "Avalanche",
    "BNB Chain",
    "Solana",
  ],
  chainlinkServices: [
    "CCIP",
    "Data Streams", 
    "Functions",
    "VRF",
    "Automation",
    "Price Feeds",
  ],
  links: {
    twitter: "https://twitter.com/crosschaindefi",
    discord: "https://discord.gg/crosschaindefi",
    github: "https://github.com/crosschaindefi",
    docs: "https://docs.crosschaindefi.com",
    blog: "https://blog.crosschaindefi.com",
    telegram: "https://t.me/crosschaindefi",
  },
  company: {
    name: "CrossChainDefi Labs",
    description: "Building the future of decentralized finance through AI and cross-chain innovation",
    location: "Global",
    founded: "2024",
  }
}
