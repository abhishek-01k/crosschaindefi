# CrossChainDefi Frontend Setup Guide

This guide will walk you through setting up the CrossChainDefi frontend, a next-generation cross-chain DeFi platform with AI agents and Chainlink integration.

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or later)
- **npm** or **yarn** or **pnpm**
- **Git**

## 📦 Step 1: Install Dependencies

Navigate to the frontend directory and install all required dependencies:

```bash
git clone and cd into the dir
npm install
```

This will install all the dependencies listed in `package.json`, including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Web3 libraries (Wagmi, Viem, RainbowKit)
- UI components (shadcn/ui)
- Animation libraries (Framer Motion)
- And many more...

## 🔧 Step 2: Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp env.template .env.local
   ```

2. **Configure your environment variables** in `.env.local`:

   ### Essential Configuration
   ```bash
# Application
   NEXT_PUBLIC_APP_NAME="CrossChainDefi"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_ENV="development"
   
   # Wallet Connect (Required for wallet connections)
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_walletconnect_project_id"
   ```

   ### Get WalletConnect Project ID
   1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   2. Create a new project
   3. Copy the Project ID and paste it in your `.env.local`

   ### RPC URLs (Required for blockchain connections)
   ```bash
   # Get these from providers like Alchemy, Infura, or QuickNode
   NEXT_PUBLIC_ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   NEXT_PUBLIC_ARBITRUM_RPC_URL="https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   NEXT_PUBLIC_OPTIMISM_RPC_URL="https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   NEXT_PUBLIC_BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   NEXT_PUBLIC_AVALANCHE_RPC_URL="https://avalanche-mainnet.infura.io/v3/YOUR_API_KEY"
   NEXT_PUBLIC_BSC_RPC_URL="https://bsc-dataseed.binance.org/"
   ```

   ### Optional API Keys (for full functionality)
   ```bash
   # Chainlink Integration
   CHAINLINK_API_KEY="your_chainlink_api_key"
   CHAINLINK_API_SECRET="your_chainlink_api_secret"
   
   # Polymarket API
   POLYMARKET_API_KEY="your_polymarket_api_key"
   
   # AI Services
   OPENAI_API_KEY="your_openai_api_key"
   ANTHROPIC_API_KEY="your_anthropic_api_key"
   ```

## 🚀 Step 3: Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🛠 Step 4: Development Workflow

### Available Scripts

- **Development**: `npm run dev` - Start development server with hot reload
- **Build**: `npm run build` - Create production build
- **Production**: `npm run start` - Start production server
- **Linting**: `npm run lint` - Run ESLint checks
- **Type Checking**: `npm run typecheck` - Run TypeScript checks

### Project Structure

```
frontend-crosschaindefi/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── hero-section.tsx  # Landing page sections
│   ├── agents-section.tsx
│   └── ...
├── lib/                  # Utility functions
│   ├── web3.ts          # Web3 configuration
│   └── utils.ts         # Helper functions
├── config/              # Configuration files
│   └── site.ts         # Site configuration
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS
└── public/             # Static assets
```

## 🔗 Step 5: Web3 Integration

The platform uses the latest Web3 stack:

### Wallet Connection
- **RainbowKit**: Beautiful wallet connection UI
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Safe
- And many more...

### Supported Networks
- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Base
- Avalanche C-Chain
- BNB Smart Chain

## 🤖 Step 6: AI Agents Overview

The platform features 7 specialized AI agents:

1. **Arbitrage Coordinator**
   - Detects cross-chain arbitrage opportunities
   - Uses Chainlink CCIP for coordination

2. **Market Intelligence**
   - Analyzes prediction markets
   - Uses Chainlink Data Streams

3. **Cross-Chain Bridge**
   - Manages CCIP transactions
   - Handles liquidity movement

4. **AI Computation**
   - Executes ML models
   - Uses Chainlink Functions

5. **Automation Agent**
   - Manages job scheduling
   - Uses Chainlink Automation

6. **Randomization Agent**
   - Provides verifiable randomness
   - Uses Chainlink VRF

7. **Treasury Agent**
   - Portfolio management
   - Risk assessment

## 🎨 Step 7: UI Components

The platform uses shadcn/ui components with Tailwind CSS:

### Key Components
- **Card**: For displaying information
- **Button**: Interactive elements
- **Badge**: Status indicators
- **Progress**: Progress bars
- **Motion**: Framer Motion animations

### Theme System
- Dark/Light mode support
- Consistent color palette
- Responsive design
- Modern glassmorphism effects

## 🔧 Step 8: Customization

### Adding New Components
1. Create component in `components/` directory
2. Export from the component file
3. Import and use in pages or other components

### Styling
- Use Tailwind CSS classes
- Follow existing design patterns
- Ensure responsive design

### Adding New Features
1. Create necessary components
2. Add to navigation (if needed)
3. Update site configuration
4. Test across different screen sizes

## 🐛 Step 9: Troubleshooting

### Common Issues

1. **Dependencies not installing**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript errors**:
   ```bash
   npm run typecheck
   ```

3. **Linting errors**:
   ```bash
   npm run lint:fix
   ```

4. **Build errors**:
   - Check environment variables
   - Ensure all imports are correct
   - Run `npm run typecheck`

### Performance Tips
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use Suspense for code splitting

## 🚀 Step 10: Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Similar to Vercel
- **Docker**: Use provided Dockerfile
- **Self-hosted**: Build and serve static files

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [Chainlink Documentation](https://docs.chain.link/)

## 🤝 Getting Help

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console for error messages
3. Check that all environment variables are set correctly
4. Ensure you have the latest dependencies installed

---

**Happy coding! 🚀** 