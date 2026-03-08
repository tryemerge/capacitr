import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@capacitr/database/schema"

/**
 * lpv2-specific DB client.
 * Reads LPV2_DATABASE_URL (preferred) or falls back to DATABASE_URL.
 */

let _db: ReturnType<typeof drizzle> | undefined

export function getDb() {
  if (!_db) {
    const url = process.env.LPV2_DATABASE_URL || process.env.DATABASE_URL
    if (!url) throw new Error("LPV2_DATABASE_URL or DATABASE_URL is not set")

    // Strip params postgres.js doesn't understand
    const clean = new URL(url)
    clean.searchParams.delete("pgbouncer")
    clean.searchParams.delete("statement_cache_size")
    clean.searchParams.delete("channel_binding")

    const sql = postgres(clean.toString(), { max: 3, prepare: false })
    _db = drizzle(sql, { schema })
  }
  return _db
}
