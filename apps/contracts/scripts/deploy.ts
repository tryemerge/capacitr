import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { getSelectors, FacetCutAction, verifyContract } from "./utils.js";

const { ethers } = await network.connect({
  network: "arbitrumSepolia",
  chainType: "l1",
});

const [deployer] = await ethers.getSigners();
const chainId = (await ethers.provider.getNetwork()).chainId;

console.log(`Deploying to chain ${chainId} with account ${deployer.address}`);
console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

// --- Config ---
const TREASURY = deployer.address;
const GRADUATION_THRESHOLD = ethers.parseEther("10");
const ETH_FEE_BPS = 100n;
const TOKEN_FEE_BPS = 100n;
const AGENT_STAKE = ethers.parseEther("0.01");
const POLL_DURATION = 3600n;
const QUORUM_THRESHOLD = 3n;
const PASS_THRESHOLD = 6000n;
const JOB_POSTER_STAKE = ethers.parseUnits("100", 18);

// --- Helper ---
async function deploy(name: string, args: any[] = []) {
  console.log(`Deploying ${name}...`);
  const contract = await ethers.deployContract(name, args);
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log(`  ${name} → ${addr}`);
  return contract;
}

// --- 1. Deploy Diamond ---
console.log("\n--- Diamond ---");
const diamond = await deploy("IdeaMarketplace", [
  TREASURY,
  GRADUATION_THRESHOLD,
  ETH_FEE_BPS,
  TOKEN_FEE_BPS,
  AGENT_STAKE,
  POLL_DURATION,
  QUORUM_THRESHOLD,
  PASS_THRESHOLD,
  JOB_POSTER_STAKE,
]);
const diamondAddress = await diamond.getAddress();

// --- 2. Deploy Core Facets ---
console.log("\n--- Core Facets ---");
const ideaFacet = await deploy("IdeaFacet");
const bondingCurveFacet = await deploy("BondingCurveFacet");
const contextFacet = await deploy("ContextFacet");
const moduleRegistryFacet = await deploy("ModuleRegistryFacet");

// --- 3. Diamond Cut: Install Core Facets ---
console.log("\n--- Core Diamond Cut ---");

const coreFacets = [
  { name: "IdeaFacet", contract: ideaFacet },
  { name: "BondingCurveFacet", contract: bondingCurveFacet },
  { name: "ContextFacet", contract: contextFacet },
  { name: "ModuleRegistryFacet", contract: moduleRegistryFacet },
];

const coreCuts = coreFacets.map(({ name, contract }) => {
  const selectors = getSelectors(contract);
  console.log(`  ${name}: ${selectors.length} selectors`);
  return {
    target: contract.target,
    action: FacetCutAction.Add,
    selectors,
  };
});

const diamondCut = await ethers.getContractAt("IdeaMarketplace", diamondAddress);
const coreTx = await diamondCut.diamondCut(coreCuts, ethers.ZeroAddress, "0x");
await coreTx.wait();
console.log("Core diamond cut complete.");

// --- 4. Deploy Module Facets ---
console.log("\n--- Module Facets ---");
const agentFacet = await deploy("AgentFacet");
const reservePoolFacet = await deploy("ReservePoolFacet");
const jobBoardFacet = await deploy("JobBoardFacet");
const workMarketplaceFacet = await deploy("WorkMarketplaceFacet");
const snapPollFacet = await deploy("SnapPollFacet");

// --- 5. Deploy Module Installers ---
console.log("\n--- Module Installers ---");
const agentModule = await deploy("AgentModule", [await agentFacet.getAddress()]);
const reservePoolModule = await deploy("ReservePoolModule", [await reservePoolFacet.getAddress()]);
const jobBoardModule = await deploy("JobBoardModule", [await jobBoardFacet.getAddress()]);
const workMarketplaceModule = await deploy("WorkMarketplaceModule", [
  await workMarketplaceFacet.getAddress(),
  await snapPollFacet.getAddress(),
]);

// --- 6. Install Modules via Registry (dependency order) ---
console.log("\n--- Installing Modules ---");

const registry = await ethers.getContractAt("ModuleRegistryFacet", diamondAddress);

const modules = [
  { name: "Agent", installer: agentModule },
  { name: "ReservePool", installer: reservePoolModule },
  { name: "JobBoard", installer: jobBoardModule },
  { name: "WorkMarketplace", installer: workMarketplaceModule },
];

for (const { name, installer } of modules) {
  console.log(`  Installing ${name} module...`);
  const tx = await registry.installModule(await installer.getAddress());
  await tx.wait();
  console.log(`  ${name} module installed.`);
}

// --- 7. Verify Contracts ---
console.log("\n--- Verifying Contracts ---");

const diamondArgs = [
  TREASURY,
  GRADUATION_THRESHOLD,
  ETH_FEE_BPS,
  TOKEN_FEE_BPS,
  AGENT_STAKE,
  POLL_DURATION,
  QUORUM_THRESHOLD,
  PASS_THRESHOLD,
  JOB_POSTER_STAKE,
];

const verifications: { name: string; address: string; args: unknown[] }[] = [
  { name: "IdeaMarketplace", address: diamondAddress, args: diamondArgs },
  { name: "IdeaFacet", address: await ideaFacet.getAddress(), args: [] },
  { name: "BondingCurveFacet", address: await bondingCurveFacet.getAddress(), args: [] },
  { name: "ContextFacet", address: await contextFacet.getAddress(), args: [] },
  { name: "ModuleRegistryFacet", address: await moduleRegistryFacet.getAddress(), args: [] },
  { name: "AgentFacet", address: await agentFacet.getAddress(), args: [] },
  { name: "ReservePoolFacet", address: await reservePoolFacet.getAddress(), args: [] },
  { name: "JobBoardFacet", address: await jobBoardFacet.getAddress(), args: [] },
  { name: "WorkMarketplaceFacet", address: await workMarketplaceFacet.getAddress(), args: [] },
  { name: "SnapPollFacet", address: await snapPollFacet.getAddress(), args: [] },
  { name: "AgentModule", address: await agentModule.getAddress(), args: [await agentFacet.getAddress()] },
  { name: "ReservePoolModule", address: await reservePoolModule.getAddress(), args: [await reservePoolFacet.getAddress()] },
  { name: "JobBoardModule", address: await jobBoardModule.getAddress(), args: [await jobBoardFacet.getAddress()] },
  {
    name: "WorkMarketplaceModule",
    address: await workMarketplaceModule.getAddress(),
    args: [await workMarketplaceFacet.getAddress(), await snapPollFacet.getAddress()],
  },
];

for (const { name, address, args } of verifications) {
  console.log(`  Verifying ${name} at ${address}...`);
  await verifyContract(address, args);
}

// --- 8. Write deployment artifact ---
const deploymentData = {
  network: "arbitrumSepolia",
  chainId: Number(chainId),
  deployer: deployer.address,
  diamond: diamondAddress,
  coreFacets: {
    IdeaFacet: await ideaFacet.getAddress(),
    BondingCurveFacet: await bondingCurveFacet.getAddress(),
    ContextFacet: await contextFacet.getAddress(),
    ModuleRegistryFacet: await moduleRegistryFacet.getAddress(),
  },
  moduleFacets: {
    AgentFacet: await agentFacet.getAddress(),
    ReservePoolFacet: await reservePoolFacet.getAddress(),
    JobBoardFacet: await jobBoardFacet.getAddress(),
    WorkMarketplaceFacet: await workMarketplaceFacet.getAddress(),
    SnapPollFacet: await snapPollFacet.getAddress(),
  },
  moduleInstallers: {
    AgentModule: await agentModule.getAddress(),
    ReservePoolModule: await reservePoolModule.getAddress(),
    JobBoardModule: await jobBoardModule.getAddress(),
    WorkMarketplaceModule: await workMarketplaceModule.getAddress(),
  },
  config: {
    treasury: TREASURY,
    graduationThreshold: GRADUATION_THRESHOLD.toString(),
    ethFeeBps: Number(ETH_FEE_BPS),
    tokenFeeBps: Number(TOKEN_FEE_BPS),
    agentStake: AGENT_STAKE.toString(),
    pollDuration: Number(POLL_DURATION),
    quorumThreshold: Number(QUORUM_THRESHOLD),
    passThreshold: Number(PASS_THRESHOLD),
    jobPosterStake: JOB_POSTER_STAKE.toString(),
  },
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(import.meta.dirname, "..", "deployedContracts");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "arbitrumSepolia.json");
fs.writeFileSync(outPath, JSON.stringify(deploymentData, null, 2));
console.log(`\nDeployment written to ${outPath}`);

console.log("\nDone!");
