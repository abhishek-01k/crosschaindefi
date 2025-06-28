# CrossChainDefi Frontend

> Next-Generation Cross-Chain DeFi Platform powered by AI Agents, Chainlink services, and advanced prediction markets.

## 🚀 Features

- **7 AI Agents**: Autonomous agents for arbitrage, market intelligence, cross-chain bridging, and more
- **Cross-Chain Support**: 8+ blockchain networks via Chainlink CCIP
- **Prediction Markets**: Polymarket integration with AI-enhanced insights
- **Advanced Trading**: MEV protection, flash loans, and automated strategies
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Web3 Integration**: RainbowKit, Wagmi, and Viem for seamless wallet connections

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Wagmi + Viem + RainbowKit
- **State Management**: TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**:
   ```bash
   cd BuckyFinance/frontend-crosschaindefi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.template .env.local
   ```
   
   Fill in your API keys and configuration in `.env.local`:
   ```bash
   # Required for wallet connections
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_walletconnect_project_id"
   
   # RPC URLs (get from Alchemy, Infura, or QuickNode)
   NEXT_PUBLIC_ETHEREUM_RPC_URL="your_ethereum_rpc_url"
   NEXT_PUBLIC_POLYGON_RPC_URL="your_polygon_rpc_url"
   # ... add other chain RPC URLs
   
   # Chainlink configuration
   CHAINLINK_API_KEY="your_chainlink_api_key"
   CHAINLINK_API_SECRET="your_chainlink_api_secret"
   
   # Polymarket API
   POLYMARKET_API_KEY="your_polymarket_api_key"
   
   # AI Services
   OPENAI_API_KEY="your_openai_api_key"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript checks

## 🌐 Supported Networks

- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Base
- Avalanche C-Chain
- BNB Smart Chain
- Solana (coming soon)

## 🤖 AI Agents

The platform features 7 specialized AI agents:

1. **Arbitrage Coordinator** - Cross-chain arbitrage opportunities
2. **Market Intelligence** - Prediction market analysis
3. **Cross-Chain Bridge** - CCIP transaction management
4. **AI Computation** - ML computations via Chainlink Functions
5. **Automation Agent** - Decentralized job scheduling
6. **Randomization Agent** - VRF-powered strategy diversification
7. **Treasury Agent** - Multi-chain portfolio management

## 🔐 Security

- Smart contracts audited by leading security firms
- Multi-signature wallet support
- MEV protection mechanisms
- Comprehensive risk management systems

## 🎯 Chainlink Integration

This project showcases extensive Chainlink integration:

- **CCIP**: Cross-chain messaging and token transfers
- **Data Streams**: High-frequency market data
- **Functions**: Serverless AI/ML computations
- **VRF**: Verifiable randomness
- **Automation**: Decentralized job scheduling
- **Price Feeds**: Real-time asset pricing

## 📊 Prediction Markets

Integrated with Polymarket for:
- Real-world event trading
- AI-enhanced market insights
- Automated trading strategies
- Portfolio allocation decisions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Docker

```bash
# Build the Docker image
docker build -t crosschaindefi-frontend .

# Run the container
docker run -p 3000:3000 crosschaindefi-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://crosschaindefi.com)
- [Documentation](https://docs.crosschaindefi.com)
- [Discord](https://discord.gg/crosschaindefi)
- [Twitter](https://twitter.com/crosschaindefi)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always DYOR (Do Your Own Research) before interacting with DeFi protocols.

---

**Built with ❤️ for the DeFi community**
