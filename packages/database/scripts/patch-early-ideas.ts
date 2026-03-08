/**
 * Patch metadata for the first 8 on-chain test ideas.
 *
 * Usage:
 *   DIRECT_URL="..." tsx scripts/patch-early-ideas.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ideaMetadata } from "../src/schema";

const DIRECT_URL = process.env.DIRECT_URL!;
if (!DIRECT_URL) throw new Error("DIRECT_URL is required");

const sql = postgres(DIRECT_URL, { max: 1 });
const db = drizzle(sql);

const PATCHES: (typeof ideaMetadata.$inferInsert)[] = [
  {
    ideaId: "1",
    imageUrl: "/ideas/image.png",
    pitch: "A random test project launched during initial contract testing",
    tags: ["Test"],
    creatorName: "Test Deployer",
  },
  {
    ideaId: "2",
    imageUrl: "/ideas/openclaw_opensource.png",
    pitch: "AI-powered code editor that understands your entire codebase and writes production-ready code",
    tags: ["AI/ML", "Developer Tools", "IDE"],
    targetCustomers: "Software engineers, dev teams wanting AI-assisted coding",
    creatorName: "Gelix Labs",
  },
  {
    ideaId: "3",
    imageUrl: "/ideas/creative-agency.png",
    pitch: "AI-powered GitHub that automates code review, issue triage, and PR management",
    tags: ["AI/ML", "Developer Tools", "Git"],
    targetCustomers: "Open-source maintainers, engineering teams, DevOps",
    creatorName: "GitAI Team",
  },
  {
    ideaId: "4",
    imageUrl: "/ideas/indie-video-game.png",
    pitch: "Decentralized video platform challenging YouTube with creator-owned content and tokenized engagement",
    tags: ["Video", "Creator Economy", "Web3"],
    targetCustomers: "Content creators, video streamers, viewers seeking alternatives",
    creatorName: "OGO Media",
  },
  {
    ideaId: "5",
    imageUrl: "/ideas/event-space.png",
    pitch: "Short-form video platform with token-gated creator communities",
    tags: ["Video", "Social", "Web3"],
    creatorName: "HOP Studios",
  },
  {
    ideaId: "6",
    imageUrl: "/ideas/smart-stove-knobs.png",
    pitch: "Community-curated video discovery with AI recommendations",
    tags: ["Video", "AI", "Social"],
    creatorName: "NOO Labs",
  },
  {
    ideaId: "7",
    imageUrl: "/ideas/table-top-game.png",
    pitch: "Tokenized YouTube alternative with creator DAOs and revenue sharing",
    tags: ["Video", "DAO", "Web3"],
    creatorName: "YOU Protocol",
  },
  {
    ideaId: "8",
    imageUrl: "/ideas/3d-printed-camera-box.png",
    pitch: "Decentralized video hosting with on-chain content licensing",
    tags: ["Video", "Infrastructure", "Web3"],
    creatorName: "UOO Network",
  },
];

async function main() {
  console.log("Patching early idea metadata...\n");

  for (const row of PATCHES) {
    await db
      .insert(ideaMetadata)
      .values(row)
      .onConflictDoUpdate({
        target: ideaMetadata.ideaId,
        set: {
          imageUrl: row.imageUrl,
          pitch: row.pitch,
          tags: row.tags,
          targetCustomers: row.targetCustomers,
          creatorName: row.creatorName,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ ideaId=${row.ideaId} — ${row.creatorName}`);
  }

  console.log("\nDone!");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
