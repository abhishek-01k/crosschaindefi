# Chainlink Services Setup & CCIP Testing Guide 🔗

## 🎯 Overview

After deploying your CrossChainDefi contracts, you need to set up Chainlink services and configure cross-chain communication. This guide walks you through the complete process.

## 📋 Prerequisites

✅ **Required Deployments:**
- Hub contracts deployed on Avalanche Fuji
- Spoke contracts deployed on Base Sepolia  
- Environment variables properly configured

✅ **Required Accounts & Subscriptions:**
- Chainlink VRF Subscription (for hub chain)
- Chainlink Functions Subscription (for all chains)
- LINK tokens for funding contracts

## 🚀 Step-by-Step Setup Process

### Step 1: Set Up Chainlink Services Registration 🔗

Run the Chainlink services setup script for each deployed network:

```bash
# Setup Chainlink services on Fuji (Hub)
bun run setup:chainlink:fuji

# Setup Chainlink services on Base Sepolia (Spoke)
bun run setup:chainlink:base

# If you deployed on Ethereum Sepolia
bun run setup:chainlink:sepolia
```

**What this does:**
- ✅ Identifies contract addresses from deployments
- ✅ Configures CCIP allowed senders between contracts
- ✅ Provides subscription IDs and consumer addresses
- ✅ Shows LINK token funding requirements

**Expected Output:**
```
🔗 SETTING UP CHAINLINK SERVICES ON BASESEPOLIA...
🔗 Spoke Contracts Found:
  Depositor: 0x2c58f9388470Cef9C163d40470BDcE62C0d9888e
  Minter: 0xB16c17578917fac80fEA345ee76021204cd07C34

🎯 Setting hub as allowed sender...
✅ Depositor: Set hub as allowed sender  
✅ Minter: Set hub as allowed sender

💰 Send LINK to these addresses:
   - CrossChainDepositor: 0x2c58f9388470Cef9C163d40470BDcE62C0d9888e
   - CrossChainMinter: 0xB16c17578917fac80fEA345ee76021204cd07C34
```

### Step 2: Configure Cross-Chain Communication 🌐

Set up the hub-spoke relationships and CCIP messaging:

```bash
# Configure cross-chain communication between all deployed chains
bun run setup:cross-chain
```

**What this does:**
- ✅ Registers spoke contracts with the hub
- ✅ Sets up bidirectional CCIP allowed senders
- ✅ Configures chain selectors and addresses
- ✅ Validates cross-chain relationships

**Expected Output:**
```
🌐 SETTING UP CROSS-CHAIN COMMUNICATION...
🏛️  Hub Chain: FUJI
   Hub Address: 0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab

📋 Registering BASESEPOLIA with hub...
✅ Registered depositor with hub
✅ Registered minter with hub  
✅ Set depositor as allowed sender
✅ Set minter as allowed sender

🔧 Setting up BASESEPOLIA spoke contracts...
✅ Depositor: Set hub as allowed sender
✅ Minter: Set hub as allowed sender
```

### Step 3: Manual Chainlink Subscription Setup 📝

#### A. VRF Subscription (Hub Chain Only)

1. **Visit VRF Console:** https://vrf.chain.link/
2. **Select Avalanche Fuji network**
3. **Find your subscription** (ID from environment variables)
4. **Add Consumer Contracts:**
   ```
   Hub Contract: 0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab
   Arbitrage Agent: 0xD103937FEaf0DF4c8ADD4fe28Cfc7830B66DF919
   ```
5. **Fund with LINK tokens** (minimum 5 LINK recommended)

#### B. Functions Subscription (All Chains)

1. **Visit Functions Console:** https://functions.chain.link/
2. **For each network (Fuji, Base Sepolia):**
   - Select the network
   - Find your subscription ID
   - Add consumer contracts from deployment info
   - Fund with LINK tokens (minimum 2 LINK per chain)

#### C. LINK Token Funding 💰

Get LINK tokens from faucets and send to contracts:

**Faucet Links:**
- 🚰 **Avalanche Fuji:** https://faucets.chain.link/fuji
- 🚰 **Base Sepolia:** https://faucets.chain.link/base-sepolia  
- 🚰 **Ethereum Sepolia:** https://faucets.chain.link/sepolia

**Funding Amounts (per contract):**
- **Hub Contracts:** 2-5 LINK each
- **Spoke Contracts:** 1-2 LINK each

**Base Sepolia Contract Addresses (Example):**
```bash
# Send LINK to these addresses:
CrossChainDepositor: 0x2c58f9388470Cef9C163d40470BDcE62C0d9888e
CrossChainMinter: 0xB16c17578917fac80fEA345ee76021204cd07C34
```

### Step 4: Test CCIP Functionality 🧪

Run comprehensive CCIP tests to verify everything is working:

```bash
# Run full CCIP test suite
bun run test:ccip
```

**What this tests:**
1. **Configuration Check** - Verifies hub-spoke relationships
2. **Deposit Test** - Tests spoke → hub messaging  
3. **Mint Test** - Tests hub → spoke messaging
4. **LINK Balance Check** - Ensures contracts have funding

**Expected Output:**
```
🧪 CCIP CROSS-CHAIN MESSAGING TESTS
🏛️  Hub Chain: FUJI
   Hub Address: 0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab

🔗 Testing BASESEPOLIA spoke chain...

🧪 TEST 1: Testing deposit notification from BASESEPOLIA to HUB...
💰 Depositor LINK Balance: 2.0 LINK
💸 Testing deposit of 0.01 ETH...
✅ Deposit transaction confirmed in block: 8234567
🌐 CCIP Message sent successfully! Found 1 CCIP event(s)

🧪 TEST 2: Testing mint request from HUB to BASESEPOLIA...
💰 Hub LINK Balance: 5.0 LINK
💰 Testing borrow request for 100.0 USDC...
✅ Borrow request confirmed in block: 3456789
🌐 CCIP Message sent successfully! Found 1 CCIP event(s)

📊 TEST RESULTS SUMMARY:
🔗 BASESEPOLIA:
   Configuration Check: ✅ PASS
   Deposit Test (Spoke→Hub): ✅ PASS
   Mint Test (Hub→Spoke): ✅ PASS

🎯 OVERALL RESULT: ✅ ALL TESTS PASSED
```

## 🛠️ Environment Variables Setup

Ensure your `.env` file has all required variables:

```env
# Private Key (same for all chains)
PRIVATE_KEY=your_private_key_here

# RPC URLs
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHEREUM_RPC_URL=https://rpc.sepolia.org

# Chainlink Subscription IDs
VRF_SUBSCRIPTION_ID_FUJI=your_vrf_subscription_id
FUNCTIONS_SUBSCRIPTION_ID_FUJI=your_functions_subscription_id
FUNCTIONS_SUBSCRIPTION_ID_BASE_SEPOLIA=your_functions_subscription_id
FUNCTIONS_SUBSCRIPTION_ID_SEPOLIA=your_functions_subscription_id
```

## 🔧 Quick Commands Reference

```bash
# Deployment
bun run deploy:hub              # Deploy hub on Fuji
bun run deploy:spoke:base       # Deploy spoke on Base Sepolia
bun run deploy:spoke:sepolia    # Deploy spoke on Ethereum Sepolia
bun run deploy:all              # Deploy everything in order

# Setup
bun run setup:chainlink:fuji    # Setup Chainlink services on Fuji
bun run setup:chainlink:base    # Setup Chainlink services on Base Sepolia
bun run setup:cross-chain       # Configure cross-chain communication

# Testing
bun run test:ccip               # Test CCIP messaging
bun run check-balance:base-sepolia  # Check wallet balances
```

## 🔍 Troubleshooting Common Issues

### ❌ "insufficient LINK balance"
**Solution:** Fund contracts with LINK tokens from faucets

### ❌ "DestinationChainNotAllowlisted"  
**Solution:** Run `setup:cross-chain` script to configure allowed chains

### ❌ "ReceiverNotAllowlisted"
**Solution:** Ensure spoke contracts have hub set as allowed sender

### ❌ "Hub does not recognize spoke chain"
**Solution:** Run `setup:cross-chain` script to register spoke contracts

### ❌ "Could not check depositor configuration"
**Solution:** Verify RPC URLs and private key in environment variables

### ❌ "No deployment found"
**Solution:** Deploy contracts first using deployment scripts

## 📊 Current Deployment Status

Based on your deployments:

| Chain | Type | Status | Contracts |
|-------|------|--------|-----------|
| Avalanche Fuji | Hub | ✅ **Deployed** | Hub + 2 AI Agents |
| Base Sepolia | Spoke | ✅ **Deployed** | Depositor + Minter |
| Ethereum Sepolia | Spoke | 📋 **Ready to Deploy** | - |

### Base Sepolia Contracts:
```
CrossChainDepositor: 0x2c58f9388470Cef9C163d40470BDcE62C0d9888e
CrossChainMinter: 0xB16c17578917fac80fEA345ee76021204cd07C34
Hub Address: 0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab
```

## 🎯 Next Steps After Setup

1. ✅ **Complete Chainlink Setup** (subscriptions, funding)
2. ✅ **Run CCIP Tests** (verify messaging works)
3. 📋 **Deploy Additional Spoke Chains** (Ethereum Sepolia)
4. 📋 **Configure Token Support** (add supported tokens)
5. 📋 **Set Up Price Feeds** (for accurate pricing)
6. 📋 **Frontend Integration** (connect UI to contracts)

## 🌐 Important CCIP Explorer Links

Monitor your cross-chain messages:
- **CCIP Explorer:** https://ccip.chain.link/
- **Search by transaction hash** to track message delivery
- **View message status:** Pending → Success/Failed

## ⚠️ Security Notes

- 🔒 **Never commit private keys** to version control
- 🔒 **Use test keys only** for testnet deployments  
- 🔒 **Verify contract addresses** before sending funds
- 🔒 **Start with small amounts** for initial testing

This guide ensures your CrossChainDefi protocol is properly configured and ready for cross-chain operations! 🚀 