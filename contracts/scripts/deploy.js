const hre = require("hardhat");
const { network } = hre;

// Chainlink contract addresses by network
const CHAINLINK_ADDRESSES = {
  fuji: {
    router: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
    vrfCoordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610",
    keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61",
    automationRegistry: "0x819B58A646CDd8289275A87653a2aA4902b14fe6"
  },
  arbitrumSepolia: {
    router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    vrfCoordinator: "0x50d47e4142598E3411aA864e08a44284e471AC6f",
    keyHash: "0x027f94ff1465724369d9b9d9b395a8885dc842a5906d903039d10ceb25e9133a",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad"
  },
  ethereumSepolia: {
    router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad"
  },
  polygonMumbai: {
    router: "0x1035CabC275068e0F4b745A29CEDf38E13aF41b1",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
    vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2"
  },
  baseSepolia: {
    router: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    functionsRouter: "0xf9B8fc078197181C841c296C876945aaa425B278",
    vrfCoordinator: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
    keyHash: "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899",
    automationRegistry: "0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2"
  }
};

async function main() {
  console.log(`\n🚀 Deploying CrossChainDefi to ${network.name}...`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.getBalance())} ETH\n`);

  // Get Chainlink addresses for current network
  const chainlinkConfig = CHAINLINK_ADDRESSES[network.name];
  if (!chainlinkConfig) {
    throw new Error(`❌ Chainlink configuration not found for network: ${network.name}`);
  }

  console.log("🔗 Using Chainlink configuration:");
  console.log(`  Router: ${chainlinkConfig.router}`);
  console.log(`  LINK Token: ${chainlinkConfig.linkToken}`);
  console.log(`  Functions Router: ${chainlinkConfig.functionsRouter}`);
  console.log(`  VRF Coordinator: ${chainlinkConfig.vrfCoordinator}\n`);

  // VRF Subscription (would need to be created manually or via script)
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID || 1;
  
  // Functions DON ID
  const donId = process.env.FUNCTIONS_DON_ID || "0x66756e2d617661782d74657374";

  console.log("📦 Step 1: Deploying CrossChainDefiHub...");
  const CrossChainDefiHub = await hre.ethers.getContractFactory("CrossChainDefiHub");
  const hub = await CrossChainDefiHub.deploy(
    chainlinkConfig.router,
    chainlinkConfig.linkToken,
    chainlinkConfig.functionsRouter,
    chainlinkConfig.vrfCoordinator,
    subscriptionId,
    chainlinkConfig.keyHash
  );
  await hub.waitForDeployment();
  console.log(`✅ CrossChainDefiHub deployed to: ${await hub.getAddress()}`);

  console.log("\n📦 Step 2: Deploying CrossChainDepositor...");
  const CrossChainDepositor = await hre.ethers.getContractFactory("CrossChainDepositor");
  const depositor = await CrossChainDepositor.deploy(
    chainlinkConfig.router,
    chainlinkConfig.linkToken,
    await hub.getAddress(), // hub address
    chainlinkConfig.automationRegistry
  );
  await depositor.waitForDeployment();
  console.log(`✅ CrossChainDepositor deployed to: ${await depositor.getAddress()}`);

  console.log("\n📦 Step 3: Deploying CrossChainMinter...");
  const CrossChainMinter = await hre.ethers.getContractFactory("CrossChainMinter");
  const minter = await CrossChainMinter.deploy(
    chainlinkConfig.router,
    chainlinkConfig.linkToken,
    await hub.getAddress(), // hub address
    chainlinkConfig.automationRegistry
  );
  await minter.waitForDeployment();
  console.log(`✅ CrossChainMinter deployed to: ${await minter.getAddress()}`);

  console.log("\n📦 Step 4: Deploying ArbitrageCoordinatorAgent...");
  const ArbitrageCoordinatorAgent = await hre.ethers.getContractFactory("ArbitrageCoordinatorAgent");
  const arbitrageAgent = await ArbitrageCoordinatorAgent.deploy(
    chainlinkConfig.router,
    chainlinkConfig.linkToken,
    chainlinkConfig.functionsRouter,
    donId,
    subscriptionId,
    chainlinkConfig.vrfCoordinator,
    chainlinkConfig.keyHash,
    await hub.getAddress(),
    chainlinkConfig.automationRegistry
  );
  await arbitrageAgent.waitForDeployment();
  console.log(`✅ ArbitrageCoordinatorAgent deployed to: ${await arbitrageAgent.getAddress()}`);

  console.log("\n📦 Step 5: Deploying MarketIntelligenceAgent...");
  const MarketIntelligenceAgent = await hre.ethers.getContractFactory("MarketIntelligenceAgent");
  const marketAgent = await MarketIntelligenceAgent.deploy(
    chainlinkConfig.functionsRouter,
    donId,
    subscriptionId,
    await hub.getAddress(),
    chainlinkConfig.automationRegistry
  );
  await marketAgent.waitForDeployment();
  console.log(`✅ MarketIntelligenceAgent deployed to: ${await marketAgent.getAddress()}`);

  console.log("\n🔗 Step 6: Setting up agent addresses in hub...");
  await hub.setAgentAddresses(
    await arbitrageAgent.getAddress(),
    await marketAgent.getAddress()
  );
  console.log("✅ Agent addresses configured in hub");

  console.log("\n🔑 Step 7: Setting up roles and permissions...");
  
  // Grant roles to agents
  const AGENT_ROLE = await hub.AGENT_ROLE();
  await hub.grantRole(AGENT_ROLE, await arbitrageAgent.getAddress());
  await hub.grantRole(AGENT_ROLE, await marketAgent.getAddress());
  console.log("✅ Agent roles granted");

  // Register agents in depositor and minter
  await depositor.registerAgent(await arbitrageAgent.getAddress());
  await depositor.registerAgent(await marketAgent.getAddress());
  await minter.registerAgent(await arbitrageAgent.getAddress());
  await minter.registerAgent(await marketAgent.getAddress());
  console.log("✅ Agents registered in depositor and minter");

  console.log("\n📊 Deployment Summary:");
  console.log("================================");
  console.log(`🏛️  CrossChainDefiHub:        ${await hub.getAddress()}`);
  console.log(`💰 CrossChainDepositor:       ${await depositor.getAddress()}`);
  console.log(`🏭 CrossChainMinter:          ${await minter.getAddress()}`);
  console.log(`⚡ ArbitrageCoordinatorAgent: ${await arbitrageAgent.getAddress()}`);
  console.log(`📈 MarketIntelligenceAgent:   ${await marketAgent.getAddress()}`);
  console.log("================================");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    chainlinkConfig,
    contracts: {
      CrossChainDefiHub: await hub.getAddress(),
      CrossChainDepositor: await depositor.getAddress(),
      CrossChainMinter: await minter.getAddress(),
      ArbitrageCoordinatorAgent: await arbitrageAgent.getAddress(),
      MarketIntelligenceAgent: await marketAgent.getAddress()
    },
    deployer: deployer.address
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to deployments/${network.name}.json`);
  
  console.log("\n✅ All contracts deployed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Fund VRF subscription with LINK tokens");
  console.log("2. Add consumer contracts to VRF subscription");
  console.log("3. Set up Chainlink Functions subscriptions");
  console.log("4. Configure Chainlink Automation jobs");
  console.log("5. Add price feeds for supported tokens");
  console.log("6. Test cross-chain operations\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 