import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { governanceRuns } from "@capacitr/database/schema";
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
      .from(governanceRuns)
      .where(eq(governanceRuns.id, params.id));

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
      .delete(governanceRuns)
      .where(
        and(
          eq(governanceRuns.id, params.id),
          eq(governanceRuns.userId, session.user.id),
        ),
      )
      .returning({ id: governanceRuns.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
