const hre = require("hardhat");

// Mock Chainlink addresses for localhost testing
const MOCK_ADDRESSES = {
  router: "0x0000000000000000000000000000000000000001",
  linkToken: "0x0000000000000000000000000000000000000002",
  functionsRouter: "0x0000000000000000000000000000000000000003",
  vrfCoordinator: "0x0000000000000000000000000000000000000004",
  keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
  automationRegistry: "0x0000000000000000000000000000000000000005"
};

async function main() {
  console.log("\n🚀 Deploying CrossChainDefi to localhost...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.getBalance())} ETH\n`);

  const subscriptionId = 1;
  const donId = "0x66756e2d617661782d74657374";

  console.log("📦 Step 1: Deploying CrossChainDefiHub...");
  const CrossChainDefiHub = await hre.ethers.getContractFactory("CrossChainDefiHub");
  const hub = await CrossChainDefiHub.deploy(
    MOCK_ADDRESSES.router,
    MOCK_ADDRESSES.linkToken,
    MOCK_ADDRESSES.functionsRouter,
    MOCK_ADDRESSES.vrfCoordinator,
    subscriptionId,
    MOCK_ADDRESSES.keyHash
  );
  await hub.waitForDeployment();
  console.log(`✅ CrossChainDefiHub deployed to: ${await hub.getAddress()}`);

  console.log("\n📦 Step 2: Deploying CrossChainDepositor...");
  const CrossChainDepositor = await hre.ethers.getContractFactory("CrossChainDepositor");
  const depositor = await CrossChainDepositor.deploy(
    MOCK_ADDRESSES.router,
    MOCK_ADDRESSES.linkToken,
    await hub.getAddress(),
    MOCK_ADDRESSES.automationRegistry
  );
  await depositor.waitForDeployment();
  console.log(`✅ CrossChainDepositor deployed to: ${await depositor.getAddress()}`);

  console.log("\n📦 Step 3: Deploying CrossChainMinter...");
  const CrossChainMinter = await hre.ethers.getContractFactory("CrossChainMinter");
  const minter = await CrossChainMinter.deploy(
    MOCK_ADDRESSES.router,
    MOCK_ADDRESSES.linkToken,
    await hub.getAddress(),
    MOCK_ADDRESSES.automationRegistry
  );
  await minter.waitForDeployment();
  console.log(`✅ CrossChainMinter deployed to: ${await minter.getAddress()}`);

  console.log("\n📦 Step 4: Deploying ArbitrageCoordinatorAgent...");
  const ArbitrageCoordinatorAgent = await hre.ethers.getContractFactory("ArbitrageCoordinatorAgent");
  const arbitrageAgent = await ArbitrageCoordinatorAgent.deploy(
    MOCK_ADDRESSES.router,
    MOCK_ADDRESSES.linkToken,
    MOCK_ADDRESSES.functionsRouter,
    donId,
    subscriptionId,
    MOCK_ADDRESSES.vrfCoordinator,
    MOCK_ADDRESSES.keyHash,
    await hub.getAddress(),
    MOCK_ADDRESSES.automationRegistry
  );
  await arbitrageAgent.waitForDeployment();
  console.log(`✅ ArbitrageCoordinatorAgent deployed to: ${await arbitrageAgent.getAddress()}`);

  console.log("\n📦 Step 5: Deploying MarketIntelligenceAgent...");
  const MarketIntelligenceAgent = await hre.ethers.getContractFactory("MarketIntelligenceAgent");
  const marketAgent = await MarketIntelligenceAgent.deploy(
    MOCK_ADDRESSES.functionsRouter,
    donId,
    subscriptionId,
    await hub.getAddress(),
    MOCK_ADDRESSES.automationRegistry
  );
  await marketAgent.waitForDeployment();
  console.log(`✅ MarketIntelligenceAgent deployed to: ${await marketAgent.getAddress()}`);

  console.log("\n🔗 Step 6: Setting up agent addresses in hub...");
  await hub.setAgentAddresses(
    await arbitrageAgent.getAddress(),
    await marketAgent.getAddress()
  );
  console.log("✅ Agent addresses configured in hub");

  console.log("\n📊 Deployment Summary:");
  console.log("================================");
  console.log(`🏛️  CrossChainDefiHub:        ${await hub.getAddress()}`);
  console.log(`💰 CrossChainDepositor:       ${await depositor.getAddress()}`);
  console.log(`🏭 CrossChainMinter:          ${await minter.getAddress()}`);
  console.log(`⚡ ArbitrageCoordinatorAgent: ${await arbitrageAgent.getAddress()}`);
  console.log(`📈 MarketIntelligenceAgent:   ${await marketAgent.getAddress()}`);
  console.log("================================");

  console.log("\n✅ Local deployment successful!");
  console.log("🧪 Ready for testing and development");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 