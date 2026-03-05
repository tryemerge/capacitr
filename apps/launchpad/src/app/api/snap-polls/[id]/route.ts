import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { snapPolls, snapPollVotes } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const [poll] = await db
      .select()
      .from(snapPolls)
      .where(eq(snapPolls.id, params.id));

    if (!poll) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const votes = await db
      .select()
      .from(snapPollVotes)
      .where(eq(snapPollVotes.pollId, params.id));

    return NextResponse.json({ ...poll, votes });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
