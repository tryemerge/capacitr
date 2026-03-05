import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { launchpadSetups } from "@capacitr/database/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const deleted = await db
      .delete(launchpadSetups)
      .where(
        and(
          eq(launchpadSetups.id, params.id),
          eq(launchpadSetups.userId, session.user.id),
        ),
      )
      .returning({ id: launchpadSetups.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
