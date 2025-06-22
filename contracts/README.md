# CrossChainDefi Smart Contracts

## Overview

CrossChainDefi is a focused cross-chain DeFi lending and borrowing platform powered by AI agents and Chainlink's comprehensive oracle infrastructure. The platform consists of 5 core smart contracts working together to provide seamless cross-chain operations, automated arbitrage, and AI-powered lending optimization strategies.

## Architecture

### Core Protocol Contracts

#### 1. CrossChainDefiHub.sol
The main protocol hub that coordinates all cross-chain operations, lending/borrowing, and AI agent interactions.

**Key Features:**
- Cross-chain asset transfers via Chainlink CCIP
- Lending and borrowing with dynamic interest rates
- Health factor monitoring and liquidation protection
- AI-powered credit scoring via Chainlink Functions
- Protocol governance and fee management
- Integration with AI agents for coordinated operations

#### 2. CrossChainDepositor.sol
Handles asset deposits from source chains with automated yield optimization.

**Key Features:**
- Multi-asset deposit support across supported chains
- Cross-chain messaging via CCIP to hub
- Automated yield optimization strategies
- AI-powered deposit routing and strategy selection
- Integration with lending protocols for maximum yield

#### 3. CrossChainMinter.sol
Manages minting and burning of protocol tokens on destination chains with collateral management.

**Key Features:**
- Cross-chain token minting/burning coordination
- Multi-collateral support with dynamic ratios
- Health factor monitoring and liquidation management
- Automated rebalancing across chains
- Stability pool and protocol fee management

### AI Agent Contracts

#### 4. ArbitrageCoordinatorAgent.sol
Orchestrates cross-chain arbitrage opportunities using comprehensive Chainlink services.

**Chainlink Services:**
- CCIP for cross-chain coordination and execution
- Data Streams for real-time price feeds
- Automation for optimal execution timing
- Functions for ML-powered opportunity analysis
- VRF for strategy diversification

#### 5. MarketIntelligenceAgent.sol
Analyzes DeFi lending markets and generates yield optimization insights.

**Chainlink Services:**
- Data Feeds for lending protocol rates
- Functions for AI/ML market analysis
- Automation for continuous market monitoring
- Cross-chain lending rate analysis and optimization

## Chainlink Services Integration

### 1. CCIP (Cross-Chain Interoperability Protocol)
- **Purpose**: Secure cross-chain communication and token transfers
- **Implementation**: All cross-chain operations, programmable token transfers
- **Contracts**: CrossChainDefiHub, CrossChainDepositor, CrossChainMinter, ArbitrageCoordinatorAgent

### 2. Data Streams
- **Purpose**: High-frequency, low-latency market data
- **Implementation**: Real-time price feeds for arbitrage and yield optimization
- **Contracts**: ArbitrageCoordinatorAgent, MarketIntelligenceAgent

### 3. Functions
- **Purpose**: Serverless compute for AI/ML operations
- **Implementation**: Credit scoring, market analysis, lending rate optimization
- **Contracts**: CrossChainDefiHub, ArbitrageCoordinatorAgent, MarketIntelligenceAgent

### 4. VRF (Verifiable Random Function)
- **Purpose**: Verifiable randomness for strategy diversification
- **Implementation**: Random strategy selection, arbitrage timing optimization
- **Contracts**: ArbitrageCoordinatorAgent

### 5. Automation
- **Purpose**: Decentralized job scheduling and execution
- **Implementation**: Automated yield harvesting, rebalancing, liquidations, market monitoring
- **Contracts**: All 5 core contracts with automated upkeep functionality

### 6. Price Feeds
- **Purpose**: Reliable asset pricing for all operations
- **Implementation**: Health factor calculations, liquidations, collateral valuations
- **Contracts**: CrossChainDefiHub, CrossChainMinter, MarketIntelligenceAgent

## Supported Networks

- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Base
- Avalanche C-Chain
- BNB Smart Chain
- Solana (via CCIP integration)

## Security Features

- Multi-signature governance
- Time-locked administrative functions
- Health factor monitoring with automated liquidations
- Circuit breakers for emergency stops
- Comprehensive audit trails
- MEV protection mechanisms

## Getting Started

### Prerequisites
- Node.js v18+
- Hardhat
- Foundry (optional)
- Access to Chainlink services

### Installation
```bash
npm install
```

### Deployment
```bash
# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Configuration
1. Set up Chainlink service subscriptions
2. Configure cross-chain selectors
3. Set up AI agent parameters
4. Initialize token allowlists

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run coverage
npm run coverage
```

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Audit](./docs/SECURITY.md)

## License

MIT License - see [LICENSE](../LICENSE) file for details. 