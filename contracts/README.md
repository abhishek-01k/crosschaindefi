# CrossChainDefi Smart Contracts

AI-powered cross-chain DeFi lending protocol with full Chainlink integration.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- Bun or npm
- Git
- Test ETH on target networks

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 3. Compile Contracts
```bash
bun run build
```

### 4. Deploy to Networks
```bash
# Deploy to Avalanche Fuji (Hub Chain)
bun run deploy:fuji

# Deploy to Base Sepolia
bun run deploy:base-sepolia

# Deploy to Ethereum Sepolia
bun run deploy:sepolia
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Private Key (Use test key only!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
ALCHEMY_API_KEY=your_alchemy_api_key

# Chainlink Subscriptions (Create these first!)
VRF_SUBSCRIPTION_ID_FUJI=1
VRF_SUBSCRIPTION_ID_BASE_SEPOLIA=1
VRF_SUBSCRIPTION_ID_SEPOLIA=1

FUNCTIONS_SUBSCRIPTION_ID_FUJI=1
FUNCTIONS_SUBSCRIPTION_ID_BASE_SEPOLIA=1
FUNCTIONS_SUBSCRIPTION_ID_SEPOLIA=1

# API Keys for Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

## 📋 Pre-Deployment Checklist

### 1. Fund Your Wallet
Ensure you have testnet ETH on:
- ✅ Avalanche Fuji
- ✅ Base Sepolia  
- ✅ Ethereum Sepolia

### 2. Create Chainlink Subscriptions

#### VRF Subscriptions
Visit [Chainlink VRF Dashboard](https://vrf.chain.link/) and create subscriptions for:
- Avalanche Fuji
- Base Sepolia
- Ethereum Sepolia

#### Functions Subscriptions
Visit [Chainlink Functions Dashboard](https://functions.chain.link/) and create subscriptions for:
- Avalanche Fuji
- Base Sepolia
- Ethereum Sepolia

## 🚀 Deployment Commands

```bash
# Deploy to specific networks
bun run deploy:fuji           # Avalanche Fuji (Hub)
bun run deploy:base-sepolia   # Base Sepolia
bun run deploy:sepolia        # Ethereum Sepolia

# Deploy to all networks
bun run deploy:all

# Verify contracts
bun run verify:fuji
bun run verify:base-sepolia
bun run verify:sepolia
```

## 📊 Contract Architecture

### Core Contracts
1. **CrossChainDefiHub** - Main protocol coordinator
2. **CrossChainDepositor** - Handles deposits and yield strategies
3. **CrossChainMinter** - Manages token minting/burning
4. **ArbitrageCoordinatorAgent** - AI-powered arbitrage execution
5. **MarketIntelligenceAgent** - Market analysis and yield optimization

### Chainlink Integrations
- **CCIP** - Cross-chain messaging
- **Functions** - AI/ML computations
- **Data Feeds** - Price oracles
- **VRF** - Randomness for strategies
- **Automation** - Automated maintenance

## 🔍 Post-Deployment Setup

After successful deployment, you need to:

### 1. Fund VRF Subscriptions
```bash
# Visit VRF dashboard and add LINK tokens
# Add deployed contracts as consumers
```

### 2. Configure Functions
```bash
# Upload Functions source code
# Add contracts as authorized consumers
```

### 3. Set Up Price Feeds
```bash
# Configure supported tokens
# Set price feed addresses
```

### 4. Configure Cross-Chain Settings
```bash
# Set allowed chains
# Configure CCIP settings
```

## 📁 Deployment Artifacts

After deployment, check the `deployments/` folder for:
- Contract addresses
- Constructor parameters
- Network configurations
- Verification status

## 🛠️ Development

### Run Tests
```bash
bun run test
```

### Coverage Report
```bash
bun run coverage
```

### Contract Size Analysis
```bash
bun run size
```

### Security Analysis
```bash
bun run analyze
```

## 🔒 Security

- All contracts use OpenZeppelin libraries
- Access control with role-based permissions
- Reentrancy protection
- Pausable emergency mechanisms

## 📚 Documentation

- [Chainlink CCIP Docs](https://docs.chain.link/ccip)
- [Chainlink Functions Docs](https://docs.chain.link/chainlink-functions)
- [Chainlink VRF Docs](https://docs.chain.link/vrf)

## 🤝 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Ensure sufficient testnet funds
4. Check Chainlink subscription status

## 📄 License

MIT License - see LICENSE file for details. 