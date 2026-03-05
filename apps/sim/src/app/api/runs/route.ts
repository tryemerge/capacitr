import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { emitterRuns } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    // Return list without snapshots (large blobs) for the list view
    const runs = await db
      .select({
        id: emitterRuns.id,
        name: emitterRuns.name,
        createdAt: emitterRuns.createdAt,
        rounds: emitterRuns.rounds,
        preset: emitterRuns.preset,
        configUsed: emitterRuns.configUsed,
        summary: emitterRuns.summary,
      })
      .from(emitterRuns)
      .where(eq(emitterRuns.userId, session.user.id))
      .orderBy(desc(emitterRuns.createdAt));

    return NextResponse.json(runs);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, rounds, preset, configUsed, summary, snapshots } = body as {
      id: string;
      name: string;
      rounds: number;
      preset?: string;
      configUsed?: unknown;
      summary: unknown;
      snapshots: unknown;
    };

    const db = getDb();
    const [row] = await db
      .insert(emitterRuns)
      .values({
        id,
        userId: session.user.id,
        name,
        rounds,
        preset,
        configUsed,
        summary,
        snapshots,
      })
      .onConflictDoUpdate({
        target: emitterRuns.id,
        set: { name, rounds, preset, configUsed, summary, snapshots },
      })
      .returning({
        id: emitterRuns.id,
        name: emitterRuns.name,
        createdAt: emitterRuns.createdAt,
      });

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
