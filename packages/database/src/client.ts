import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL → PgBouncer (pooled, for runtime queries)
// DIRECT_URL   → direct connection (for migrations only)

function createClient(url: string, options?: postgres.Options<{}>) {
  const sql = postgres(url, { prepare: false, ...options });
  return drizzle(sql, { schema });
}

// Module-level singleton — reused across warm Lambda invocations
let _db: ReturnType<typeof createClient> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _db = createClient(url, { max: 1 });
  }
  return _db;
}

// Direct client for migrations (bypasses PgBouncer)
export function getMigrationClient() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL is not set");
  return postgres(url, { max: 1 });
}

// Direct drizzle client — for use by Better Auth (avoids pgbouncer startup param rejection)
let _directDb: ReturnType<typeof createClient> | undefined;

export function getDirectDb() {
  if (!_directDb) {
    const url = process.env.DIRECT_URL;
    if (!url) throw new Error("DIRECT_URL is not set");
    _directDb = createClient(url, { max: 1 });
  }
  return _directDb;
}
