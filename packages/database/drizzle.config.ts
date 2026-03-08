import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DIRECT_URL for migrations (bypasses PgBouncer)
    url: process.env.DIRECT_URL!,
  },
  // Only manage our tables — prevents drizzle from touching GCP extension views
  tablesFilter: [
    "user",
    "session",
    "account",
    "verification",
    "idea_metadata",
    "projects",
    "agents",
    "work_submissions",
    "snap_polls",
    "snap_poll_votes",
    "agent_configs",
    "referrals",
    "investors",
    "trades",
    "token_balances",
    "investor_token_balances",
    "w_token_balances",
    "launchpad_setups",
    "emitter_runs",
    "governance_runs",
  ],
});
