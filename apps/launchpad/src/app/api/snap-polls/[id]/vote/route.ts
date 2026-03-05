import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { snapPolls, snapPollVotes } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { vote, voterAddress, balance } = body as {
      vote: "yes" | "no";
      voterAddress: string;
      balance: number;
    };

    if (!vote || !voterAddress || balance == null) {
      return NextResponse.json(
        { error: "vote, voterAddress, and balance are required" },
        { status: 400 },
      );
    }

    if (!["yes", "no"].includes(vote)) {
      return NextResponse.json({ error: "vote must be yes or no" }, { status: 400 });
    }

    const db = getDb();

    // Check poll exists and is active
    const [poll] = await db
      .select()
      .from(snapPolls)
      .where(eq(snapPolls.id, params.id));

    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    if (poll.status !== "active") {
      return NextResponse.json({ error: "Poll is no longer active" }, { status: 400 });
    }
    if (new Date() > poll.endAt) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    // Quadratic vote weight: sqrt(balance)
    const weight = Math.sqrt(balance);

    const [voteRow] = await db
      .insert(snapPollVotes)
      .values({
        id: nanoid(),
        pollId: params.id,
        voterAddress,
        vote,
        weight,
      })
      .returning();

    // Update poll tallies
    if (vote === "yes") {
      await db
        .update(snapPolls)
        .set({ yesWeight: poll.yesWeight + weight })
        .where(eq(snapPolls.id, params.id));
    } else {
      await db
        .update(snapPolls)
        .set({ noWeight: poll.noWeight + weight })
        .where(eq(snapPolls.id, params.id));
    }

    return NextResponse.json(voteRow, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
