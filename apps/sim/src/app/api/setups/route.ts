import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { launchpadSetups } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const setups = await db
      .select()
      .from(launchpadSetups)
      .where(eq(launchpadSetups.userId, session.user.id))
      .orderBy(desc(launchpadSetups.createdAt));

    return NextResponse.json(setups);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, config } = body as { name: string; config: unknown };

    const db = getDb();
    const [row] = await db
      .insert(launchpadSetups)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name,
        config,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
