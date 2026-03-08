/**
 * Seed the Diamond with the 8 mock ideas from the frontend.
 *
 * Usage:
 *   npx hardhat --network arbitrumSepolia run scripts/seed-ideas.ts
 */

import hre from "hardhat";
import { parseEther } from "ethers";

const DIAMOND = "0x98033F10c00306a6a4D64Af84Fb6fAabCA420967";
const TOTAL_SUPPLY = parseEther("1000000"); // 1M tokens each

const IDEAS = [
  { name: "OpenClaw Agent Framework", symbol: "CLAW" },
  { name: "Runebound Chronicles", symbol: "RUNE" },
  { name: "Frogcoin", symbol: "FROG" },
  { name: "ModularGear Camera Cases", symbol: "GEAR" },
  { name: "The Foundry", symbol: "FNDRY" },
  { name: "OME Smart Kitchen", symbol: "OME" },
  { name: "Realm Tactics", symbol: "REALM" },
  { name: "Force Creative Agency", symbol: "FORCE" },
];

async function main() {
  const { ethers } = await hre.network.connect({
    network: "arbitrumSepolia",
  });
  const [deployer] = await ethers.getSigners();

  console.log(`\nSeeding ideas on Diamond: ${DIAMOND}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Get IdeaFacet ABI attached to diamond
  const ideaFacet = await ethers.getContractAt("IdeaFacet", DIAMOND);

  // Check existing idea count
  const existingCount = await ideaFacet.getIdeaCount();
  console.log(`Existing ideas on-chain: ${existingCount}\n`);

  for (const idea of IDEAS) {
    try {
      console.log(`Launching: ${idea.name} ($${idea.symbol})...`);
      const tx = await ideaFacet.launchIdea(
        idea.name,
        idea.symbol,
        TOTAL_SUPPLY
      );
      const receipt = await tx.wait();
      
      // Extract ideaId from IdeaLaunched event
      const event = receipt?.logs
        .map((log: any) => {
          try { return ideaFacet.interface.parseLog(log); } catch { return null; }
        })
        .find((e: any) => e?.name === "IdeaLaunched");

      const ideaId = event?.args?.ideaId?.toString() ?? "?";
      console.log(`  ✓ ideaId=${ideaId}  tx=${receipt?.hash}\n`);
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message ?? err}\n`);
    }
  }

  const finalCount = await ideaFacet.getIdeaCount();
  console.log(`\nDone! Total ideas on-chain: ${finalCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
