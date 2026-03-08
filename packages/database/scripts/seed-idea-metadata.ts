/**
 * Seed idea_metadata for on-chain ideas.
 *
 * Usage:
 *   DIRECT_URL="postgresql://..." npx tsx scripts/seed-idea-metadata.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ideaMetadata } from "../src/schema";

const DIRECT_URL = process.env.DIRECT_URL!;
if (!DIRECT_URL) throw new Error("DIRECT_URL is required");

const sql = postgres(DIRECT_URL, { max: 1 });
const db = drizzle(sql);

const SEED_DATA: (typeof ideaMetadata.$inferInsert)[] = [
  // ── Original test ideas (1–8) ──
  { ideaId: "1", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "2", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "3", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "4", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "5", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "6", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "7", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },
  { ideaId: "8", imageUrl: "/ideas/image.png", pitch: "Early test idea on Arbitrum Sepolia" },

  // ── Seeded ideas (9–16) — match mock data ──
  {
    ideaId: "9",
    imageUrl: "/ideas/openclaw_opensource.png",
    pitch: "Open-source agent infrastructure that lets anyone deploy, monitor, and monetize AI agents",
    problemStatement: "Building production AI agents requires expertise in orchestration, monitoring, and deployment. Developers need a framework that handles the hard parts so they can focus on agent logic.",
    tags: ["Developer Tools", "Infrastructure", "AI/ML"],
    targetCustomers: "AI developers, startups building agent-powered products, and enterprises deploying AI automation",
    creatorName: "Maya Chen",
  },
  {
    ideaId: "10",
    imageUrl: "/ideas/indie-video-game.png",
    pitch: "Norse-inspired action RPG built by a solo dev with AI agents handling art, QA, and community",
    problemStatement: "Indie game developers struggle to compete with studio budgets. A single developer can build core gameplay, but needs help with art assets, testing, marketing, and community management.",
    tags: ["Gaming", "RPG", "AI Agents"],
    targetCustomers: "Steam gamers who love indie RPGs, roguelikes, and Norse mythology",
    creatorName: "Erik Stormwald",
  },
  {
    ideaId: "11",
    imageUrl: "/ideas/image.png",
    pitch: "Community-driven memecoin with AI-powered community management and content creation",
    problemStatement: "Most memecoins lack utility and community engagement. Frogcoin combines viral appeal with AI agents that create content, moderate, and build community.",
    tags: ["Meme", "Community", "Web3"],
    targetCustomers: "Crypto-native community members, memecoin enthusiasts",
    creatorName: "FrogDAO Collective",
  },
  {
    ideaId: "12",
    imageUrl: "/ideas/3d-printed-camera-box.png",
    pitch: "Modular 3D-printed camera cases with AI-designed custom configurations",
    problemStatement: "Camera gear protection is expensive and one-size-fits-all. Photographers need affordable, custom-fit cases that adapt to their specific equipment combinations.",
    tags: ["Hardware", "3D Printing", "Photography"],
    targetCustomers: "Professional and hobbyist photographers, videographers, content creators",
    creatorName: "Alex Rivera",
  },
  {
    ideaId: "13",
    imageUrl: "/ideas/event-space.png",
    pitch: "AI-managed co-working and event spaces that adapt to community needs in real-time",
    problemStatement: "Traditional event spaces are rigid and expensive. Communities need flexible spaces that can be booked, configured, and managed without overhead.",
    tags: ["Real Estate", "Events", "AI"],
    targetCustomers: "Event organizers, community builders, startup teams, freelancers",
    creatorName: "The Foundry Collective",
  },
  {
    ideaId: "14",
    imageUrl: "/ideas/smart-stove-knobs.png",
    pitch: "Smart retrofit knobs that make any stove intelligent with temperature tracking and safety alerts",
    problemStatement: "Kitchen fires from unattended stoves are a leading cause of home fires. Most people can't afford smart stoves, but a retrofit solution could save lives.",
    tags: ["IoT", "Smart Home", "Safety"],
    targetCustomers: "Home cooks, families with children or elderly members, rental property managers",
    creatorName: "Priya Patel",
  },
  {
    ideaId: "15",
    imageUrl: "/ideas/table-top-game.png",
    pitch: "AI-enhanced tabletop RPG with procedurally generated campaigns and real-time lore tracking",
    problemStatement: "Tabletop RPGs require extensive preparation by game masters. AI can handle world-building, NPC generation, and campaign tracking to make sessions more immersive.",
    tags: ["Gaming", "Tabletop", "AI"],
    targetCustomers: "D&D players, tabletop RPG enthusiasts, game masters looking for creative tools",
    creatorName: "Realm Studios",
  },
  {
    ideaId: "16",
    imageUrl: "/ideas/creative-agency.png",
    pitch: "Decentralized creative agency where AI agents and humans collaborate on client projects",
    problemStatement: "Creative agencies have high overhead and slow turnaround. A decentralized model with AI agents handling routine work lets human creatives focus on strategy and vision.",
    tags: ["Creative", "Agency", "AI"],
    targetCustomers: "Startups needing branding, small businesses wanting marketing, creators seeking collaboration",
    creatorName: "Force Collective",
  },
];

async function main() {
  console.log("Seeding idea_metadata...\n");

  for (const row of SEED_DATA) {
    await db
      .insert(ideaMetadata)
      .values(row)
      .onConflictDoUpdate({
        target: ideaMetadata.ideaId,
        set: {
          imageUrl: row.imageUrl,
          pitch: row.pitch,
          problemStatement: row.problemStatement,
          tags: row.tags,
          targetCustomers: row.targetCustomers,
          creatorName: row.creatorName,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ ideaId=${row.ideaId} — ${row.pitch?.slice(0, 50)}...`);
  }

  console.log(`\nDone! Seeded ${SEED_DATA.length} rows.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
