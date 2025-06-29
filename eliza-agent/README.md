# CrossChain DeFi ElizaOS Agent 🤖⛓️

## Overview

This ElizaOS agent specializes in CrossChain DeFi operations, allowing users to interact with the deployed CrossChain DeFi protocol via chat interface, terminal, or Twitter. The agent can handle deposits, borrowing, repaying, and portfolio management across multiple blockchains.

## Features

- 🏦 **Deposit Collateral**: Deposit USDC/LINK on Avalanche Fuji or Base Sepolia with yield strategies
- 💰 **Cross-Chain Borrowing**: Borrow tokens on any supported chain using collateral from another
- 📊 **Portfolio Management**: Check positions, health factors, and credit scores across all chains
- 🔄 **Loan Repayment**: Repay borrowed tokens to improve health factor
- 🤖 **AI-Powered**: Natural language processing for DeFi operations
- ⛓️ **Multi-Chain**: Supports Avalanche Fuji, Base Sepolia, and Ethereum Sepolia

## Supported Operations

### Deposit
- **Chains**: Avalanche Fuji, Base Sepolia
- **Tokens**: USDC, LINK
- **Strategies**: Conservative (0), Balanced (1), Aggressive (2)
- **Features**: Auto-compounding, yield optimization

### Borrow
- **Source**: Hub contract on Avalanche Fuji
- **Destination**: Any supported chain via Chainlink CCIP
- **Tokens**: USDC, LINK
- **Requirements**: Sufficient collateral and healthy health factor

### Repay
- **Chain**: Avalanche Fuji (Hub)
- **Tokens**: USDC, LINK
- **Effect**: Improves health factor, enables more borrowing

### Portfolio
- **Data**: Cross-chain positions, health factor, credit score
- **Chains**: All supported chains
- **Real-time**: Live data from smart contracts

## Quick Start

### Prerequisites

- Node.js 23+
- Bun package manager
- Test wallet with private key
- Testnet ETH for gas fees
- API keys for AI models

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Edit environment variables (see configuration below)
nano .env

# Build the project
bun run build

# Start the agent
bun run dev
```

### Configuration

Create a `.env` file with the following variables:

```env
# AI Model API Key (choose one)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# EVM Configuration
EVM_PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY

# RPC URLs
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Optional: Twitter Integration
TWITTER_USERNAME=your_username
TWITTER_PASSWORD=your_password
TWITTER_EMAIL=your_email

# Server Configuration
SERVER_PORT=3000
DATABASE_URL=sqlite://db.sqlite
```

## Usage Examples

### Chat Interface

Once running, visit `http://localhost:3000` and interact with the agent:

**Deposit Example:**
```
User: I want to deposit 100 USDC on Avalanche Fuji with balanced strategy
Agent: I'll help you deposit 100 USDC on Avalanche Fuji with balanced strategy. Would you like to enable auto-compounding?
```

**Borrow Example:**
```
User: Can I borrow 500 USDC to Base Sepolia?
Agent: Let me check your collateral and health factor first...
[Checks health factor]
Agent: You have sufficient collateral! Initiating borrow of 500 USDC to Base Sepolia via Chainlink CCIP...
```

**Portfolio Example:**
```
User: Show me my portfolio
Agent: 📊 CrossChain DeFi Portfolio Status
Address: 0x...
Total Portfolio Value: 1,250.50 USD
Health Factor: 2.45
Credit Score: 750
[Detailed breakdown...]
```

### Terminal Interface

```bash
bun run dev
# Agent starts and listens for commands
You: deposit 50 LINK on baseSepolia with aggressive strategy
Agent: Processing deposit of 50 LINK on Base Sepolia...
```

### Twitter Integration

Configure Twitter credentials to enable the agent to respond to mentions and DMs about DeFi operations.

## Smart Contract Integration

The agent interacts with deployed contracts:

- **Hub Contract** (Avalanche Fuji): `0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab`
- **Depositor** (Avalanche Fuji): `0x56Ece20263898124295378c5b8EEf367fE3AC76F`
- **Depositor** (Base Sepolia): `0x2c58f9388470Cef9C163d40470BDcE62C0d9888e`

## Security

⚠️ **Important Security Notes:**

1. **Test Environment Only**: This agent is configured for testnets
2. **Private Key Security**: Never use mainnet private keys
3. **Fund Limits**: Only use test funds
4. **Code Review**: Always review transaction details before confirming

## Troubleshooting

### Common Issues

1. **"Health factor too low"**: You need more collateral to borrow
2. **"Insufficient balance"**: Need more tokens in your wallet
3. **"Chain not supported"**: Check if the chain is in our supported list
4. **RPC errors**: Verify RPC URLs in environment

### Getting Test Tokens

- **Avalanche Fuji**: [Faucet](https://faucet.avax.network/)
- **Base Sepolia**: [Faucet](https://bridge.base.org/deposit)
- **Ethereum Sepolia**: [Faucet](https://faucet.sepolia.dev/)

## Development

### Adding New Actions

1. Create action file in `src/custom-plugins/actions/`
2. Add types to `src/custom-plugins/types/index.ts`
3. Create template in `src/custom-plugins/templates/index.ts`
4. Update plugin in `src/custom-plugins/index.ts`

### Testing

```bash
# Run tests
bun test

# Lint code
bun run lint

# Build for production
bun run build
```

## Architecture

```
src/
├── custom-plugins/
│   ├── actions/          # DeFi operation handlers
│   ├── providers/        # Wallet and blockchain providers
│   ├── templates/        # AI prompt templates
│   ├── types/           # TypeScript interfaces
│   └── index.ts         # Plugin configuration
├── character.ts         # Agent personality and config
├── index.ts            # Main entry point
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord**: [Join our community](https://discord.gg/your-server)

---

**Disclaimer**: This is experimental software for testnet use only. Always do your own research before using any DeFi protocol.