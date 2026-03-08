import { NextResponse } from "next/server"
import { getDb } from "@capacitr/database/client"
import { ideaMetadata } from "@capacitr/database/schema"

/**
 * GET /api/ideas/metadata
 * Returns all idea metadata rows keyed by ideaId.
 */
export async function GET() {
  try {
    const db = getDb()
    const rows = await db.select().from(ideaMetadata)

    const map: Record<string, (typeof rows)[number]> = {}
    for (const row of rows) {
      map[row.ideaId] = row
    }

    return NextResponse.json(map)
  } catch (err: any) {
    console.error("Failed to fetch idea metadata:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
