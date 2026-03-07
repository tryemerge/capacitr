import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { getSelectors, FacetCutAction } from "./utils.js";

const { ethers } = await network.connect({
  network: "arbitrumSepolia",
  chainType: "l1",
});

const [deployer] = await ethers.getSigners();
const chainId = (await ethers.provider.getNetwork()).chainId;

console.log(`Deploying to chain ${chainId} with account ${deployer.address}`);
console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

// --- Config ---
const TREASURY = deployer.address; // Use deployer as treasury for now
const GRADUATION_THRESHOLD = ethers.parseEther("10"); // 10 ETH mcap
const ETH_FEE_BPS = 100n;        // 1%
const TOKEN_FEE_BPS = 100n;      // 1%
const AGENT_STAKE = ethers.parseEther("0.01");
const POLL_DURATION = 3600n;      // 1 hour
const QUORUM_THRESHOLD = 3n;      // min 3 votes
const PASS_THRESHOLD = 6000n;     // 60%
const JOB_POSTER_STAKE = ethers.parseUnits("100", 18); // 100 idea tokens

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

// --- 2. Deploy Facets ---
console.log("\n--- Facets ---");
const ideaFacet = await deploy("IdeaFacet");
const bondingCurveFacet = await deploy("BondingCurveFacet");
const reservePoolFacet = await deploy("ReservePoolFacet");
const agentFacet = await deploy("AgentFacet");
const jobBoardFacet = await deploy("JobBoardFacet");
const workMarketplaceFacet = await deploy("WorkMarketplaceFacet");
const snapPollFacet = await deploy("SnapPollFacet");

// --- 3. Diamond Cut ---
console.log("\n--- Diamond Cut ---");

const facets = [
  { name: "IdeaFacet", contract: ideaFacet },
  { name: "BondingCurveFacet", contract: bondingCurveFacet },
  { name: "ReservePoolFacet", contract: reservePoolFacet },
  { name: "AgentFacet", contract: agentFacet },
  { name: "JobBoardFacet", contract: jobBoardFacet },
  { name: "WorkMarketplaceFacet", contract: workMarketplaceFacet },
  { name: "SnapPollFacet", contract: snapPollFacet },
];

const facetCuts = facets.map(({ name, contract }) => {
  const selectors = getSelectors(contract);
  console.log(`  ${name}: ${selectors.length} selectors`);
  return {
    target: contract.target,
    action: FacetCutAction.Add,
    selectors,
  };
});

const diamondCut = await ethers.getContractAt("IdeaMarketplace", diamondAddress);
const tx = await diamondCut.diamondCut(facetCuts, ethers.ZeroAddress, "0x");
await tx.wait();
console.log("Diamond cut complete.");

// --- 4. Write deployment artifact ---
const deploymentData = {
  network: "arbitrumSepolia",
  chainId: Number(chainId),
  deployer: deployer.address,
  diamond: diamondAddress,
  facets: Object.fromEntries(
    facets.map(({ name, contract }) => [name, contract.target])
  ),
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
