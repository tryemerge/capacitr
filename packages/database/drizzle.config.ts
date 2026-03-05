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
    "launchpad_setups",
    "emitter_runs",
    "governance_runs",
  ],
});
