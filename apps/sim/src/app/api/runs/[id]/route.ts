import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { emitterRuns } from "@capacitr/database/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [run] = await db
      .select()
      .from(emitterRuns)
      .where(eq(emitterRuns.id, params.id));

    if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (run.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(run);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const deleted = await db
      .delete(emitterRuns)
      .where(
        and(
          eq(emitterRuns.id, params.id),
          eq(emitterRuns.userId, session.user.id),
        ),
      )
      .returning({ id: emitterRuns.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
