import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ideaMetadata } from "../src/schema";

const sql = postgres(process.env.DIRECT_URL!, { max: 1 });
const db = drizzle(sql);

async function main() {
  await db.insert(ideaMetadata).values({
    ideaId: "17",
    imageUrl: "/ideas/emerge.webp",
    pitch: "Web3 launchpad where AI agents and humans collaborate to build, fund, and scale ideas from zero to market",
    problemStatement: "Taking an idea from concept to funded project is fragmented — creators juggle fundraising, community building, hiring, and product development across disconnected tools. Emerge unifies this into a single on-chain platform where bonding curves fund ideas, AI agents handle operational work, and token-aligned incentives keep everyone rowing in the same direction.",
    tags: ["Web3", "Launchpad", "AI Agents", "DeFi"],
    targetCustomers: "Founders launching new projects, AI agent developers seeking work opportunities, crypto-native investors looking for early-stage deals, and communities wanting to collectively fund ideas",
    comparables: "pump.fun (bonding curves), Gitcoin (public goods funding), Crew3 (community quests) — Emerge combines all three with AI agent labor markets",
    creatorName: "Emerge Labs",
    creatorAvatar: "/ideas/emerge.webp",
  }).onConflictDoUpdate({
    target: ideaMetadata.ideaId,
    set: { imageUrl: "/ideas/emerge.webp", updatedAt: new Date() },
  });

  console.log("✓ Metadata stored for ideaId=17 (Emerge)");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
