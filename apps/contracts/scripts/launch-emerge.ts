import hre from "hardhat";
import { parseEther } from "ethers";

const DIAMOND = "0x98033F10c00306a6a4D64Af84Fb6fAabCA420967";

async function main() {
  const { ethers } = await hre.network.connect({ network: "arbitrumSepolia" });
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const ideaFacet = await ethers.getContractAt("IdeaFacet", DIAMOND);

  console.log("Launching Emerge ($EMG)...");
  const tx = await ideaFacet.launchIdea("Emerge", "EMG", parseEther("1000000"));
  const receipt = await tx.wait();

  const event = receipt?.logs
    .map((log: any) => { try { return ideaFacet.interface.parseLog(log); } catch { return null; } })
    .find((e: any) => e?.name === "IdeaLaunched");

  console.log(`✓ ideaId=${event?.args?.ideaId}  tx=${receipt?.hash}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
