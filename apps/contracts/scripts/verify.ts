import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { verifyContract } from "./utils.js";

const { ethers } = await network.connect({
  network: "arbitrumSepolia",
  chainType: "l1",
});

const deploymentPath = path.join(import.meta.dirname, "..", "deployedContracts", "arbitrumSepolia.json");
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

const TREASURY = deployment.config.treasury;
const GRADUATION_THRESHOLD = BigInt(deployment.config.graduationThreshold);
const ETH_FEE_BPS = BigInt(deployment.config.ethFeeBps);
const TOKEN_FEE_BPS = BigInt(deployment.config.tokenFeeBps);
const AGENT_STAKE = BigInt(deployment.config.agentStake);
const POLL_DURATION = BigInt(deployment.config.pollDuration);
const QUORUM_THRESHOLD = BigInt(deployment.config.quorumThreshold);
const PASS_THRESHOLD = BigInt(deployment.config.passThreshold);
const JOB_POSTER_STAKE = BigInt(deployment.config.jobPosterStake);

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

const verifications = [
  { name: "IdeaMarketplace", address: deployment.diamond, args: diamondArgs },
  // Core facets (no constructor args)
  ...Object.entries(deployment.coreFacets).map(([name, address]) => ({
    name, address: address as string, args: [],
  })),
  // Module facets (no constructor args)
  ...Object.entries(deployment.moduleFacets).map(([name, address]) => ({
    name, address: address as string, args: [],
  })),
  // Module installers (need facet addresses as constructor args)
  {
    name: "AgentModule",
    address: deployment.moduleInstallers.AgentModule,
    args: [deployment.moduleFacets.AgentFacet],
  },
  {
    name: "ReservePoolModule",
    address: deployment.moduleInstallers.ReservePoolModule,
    args: [deployment.moduleFacets.ReservePoolFacet],
  },
  {
    name: "JobBoardModule",
    address: deployment.moduleInstallers.JobBoardModule,
    args: [deployment.moduleFacets.JobBoardFacet],
  },
  {
    name: "WorkMarketplaceModule",
    address: deployment.moduleInstallers.WorkMarketplaceModule,
    args: [deployment.moduleFacets.WorkMarketplaceFacet, deployment.moduleFacets.SnapPollFacet],
  },
];

console.log(`Verifying ${verifications.length} contracts on Arbitrum Sepolia...\n`);

for (const { name, address, args } of verifications) {
  console.log(`  Verifying ${name} at ${address}...`);
  await verifyContract(address, args);
}

console.log("\nDone!");
