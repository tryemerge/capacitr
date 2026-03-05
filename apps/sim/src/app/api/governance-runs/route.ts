import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { governanceRuns } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const runs = await db
      .select({
        id: governanceRuns.id,
        name: governanceRuns.name,
        createdAt: governanceRuns.createdAt,
        rounds: governanceRuns.rounds,
        configUsed: governanceRuns.configUsed,
        summary: governanceRuns.summary,
        deliberationCount: governanceRuns.deliberationCount,
        selfFundingRatio: governanceRuns.selfFundingRatio,
      })
      .from(governanceRuns)
      .where(eq(governanceRuns.userId, session.user.id))
      .orderBy(desc(governanceRuns.createdAt));

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
    const { id, name, rounds, configUsed, summary, snapshots, deliberationCount, selfFundingRatio } = body as {
      id: string;
      name: string;
      rounds: number;
      configUsed?: unknown;
      summary: unknown;
      snapshots: unknown;
      deliberationCount?: number;
      selfFundingRatio?: number;
    };

    const db = getDb();
    const [row] = await db
      .insert(governanceRuns)
      .values({
        id,
        userId: session.user.id,
        name,
        rounds,
        configUsed,
        summary,
        snapshots,
        deliberationCount: deliberationCount ?? 0,
        selfFundingRatio,
      })
      .onConflictDoUpdate({
        target: governanceRuns.id,
        set: { name, rounds, configUsed, summary, snapshots, deliberationCount, selfFundingRatio },
      })
      .returning({
        id: governanceRuns.id,
        name: governanceRuns.name,
        createdAt: governanceRuns.createdAt,
      });

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
