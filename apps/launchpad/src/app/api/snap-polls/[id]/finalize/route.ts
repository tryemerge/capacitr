import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { snapPolls, workSubmissions } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [poll] = await db
      .select()
      .from(snapPolls)
      .where(eq(snapPolls.id, params.id));

    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    if (poll.status !== "active") {
      return NextResponse.json({ error: "Poll already finalized" }, { status: 400 });
    }
    if (new Date() < poll.endAt) {
      return NextResponse.json({ error: "Poll has not ended yet" }, { status: 400 });
    }

    const outcome = poll.yesWeight >= poll.noWeight ? "approved" : "rejected";

    // Update poll
    const [updated] = await db
      .update(snapPolls)
      .set({ status: "finalized", outcome })
      .where(eq(snapPolls.id, params.id))
      .returning();

    // Update the linked work submission
    await db
      .update(workSubmissions)
      .set({
        status: outcome,
        reviewNotes: `Snap poll result: ${outcome} (yes: ${poll.yesWeight.toFixed(2)}, no: ${poll.noWeight.toFixed(2)})`,
        updatedAt: new Date(),
      })
      .where(eq(workSubmissions.id, poll.submissionId));

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
