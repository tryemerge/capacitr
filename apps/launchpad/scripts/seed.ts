/**
 * Seed script — run with: npx tsx scripts/seed.ts
 * Requires DATABASE_URL environment variable.
 */
import { getDb } from "@capacitr/database";
import { projects } from "@capacitr/database/schema";

const SEED_PROJECTS = [
  {
    id: "seed-defi-oracle",
    userId: "REPLACE_WITH_YOUR_USER_ID",
    name: "DeFi Oracle Network",
    symbol: "ORACLE",
    description:
      "Decentralized price feeds for DeFi protocols. Contributors verify and submit price data from multiple sources.",
    systemPrompt:
      "You review work submissions for a DeFi oracle network. Approve contributions that provide verifiable price data from reputable sources. Reject submissions with stale or unverifiable data.",
    decayK: 0.002,
    graduationThreshold: 69000,
    tokenPrice: 0.0042,
    marketCap: 4200,
    totalVolume: 12500,
    workPoolValue: 500,
    contributorCount: 7,
  },
  {
    id: "seed-ai-dataset",
    userId: "REPLACE_WITH_YOUR_USER_ID",
    name: "Open AI Training Data",
    symbol: "TRAIN",
    description:
      "Community-curated training datasets for open-source AI models. Earn tokens by labeling, cleaning, and validating data.",
    systemPrompt:
      "You review data labeling and curation work. Approve submissions that follow the labeling guidelines and contain high-quality annotations. Route ambiguous cases to snap polls.",
    decayK: 0.003,
    graduationThreshold: 50000,
    tokenPrice: 0.0018,
    marketCap: 1800,
    totalVolume: 5400,
    workPoolValue: 216,
    contributorCount: 14,
  },
  {
    id: "seed-governance-dao",
    userId: "REPLACE_WITH_YOUR_USER_ID",
    name: "Protocol Governance DAO",
    symbol: "GOV",
    description:
      "Research and proposals for protocol governance improvements. Submit analysis, vote on proposals, earn tokens.",
    systemPrompt:
      "You review governance research and proposals. Approve well-researched submissions backed by data. Reject low-effort or duplicate proposals. Route controversial topics to snap polls.",
    decayK: 0.001,
    graduationThreshold: 100000,
    tokenPrice: 0.0001,
    marketCap: 100,
    totalVolume: 300,
    workPoolValue: 12,
    contributorCount: 3,
  },
];

async function seed() {
  const db = getDb();

  for (const p of SEED_PROJECTS) {
    await db
      .insert(projects)
      .values(p)
      .onConflictDoNothing({ target: projects.id });

    console.log(`Seeded: ${p.name} ($${p.symbol})`);
  }

  console.log("Done. Update userId values if needed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
