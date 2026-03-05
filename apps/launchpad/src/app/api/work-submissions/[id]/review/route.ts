import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { workSubmissions } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status, reviewNotes } = body as {
      status: "approved" | "rejected" | "snap_poll";
      reviewNotes?: string;
    };

    if (!["approved", "rejected", "snap_poll"].includes(status)) {
      return NextResponse.json(
        { error: "status must be approved, rejected, or snap_poll" },
        { status: 400 },
      );
    }

    const db = getDb();
    const [row] = await db
      .update(workSubmissions)
      .set({
        status,
        reviewedBy: session.user.id,
        reviewNotes,
        updatedAt: new Date(),
      })
      .where(eq(workSubmissions.id, params.id))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
