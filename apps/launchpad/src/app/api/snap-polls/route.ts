import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { snapPolls } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");

    const db = getDb();
    let query = db
      .select()
      .from(snapPolls)
      .orderBy(desc(snapPolls.createdAt))
      .$dynamic();

    if (projectId) {
      query = query.where(eq(snapPolls.projectId, projectId));
    }

    const rows = await query;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { projectId, submissionId, question, durationMinutes } = body as {
      projectId: string;
      submissionId: string;
      question: string;
      durationMinutes?: number;
    };

    if (!projectId || !submissionId || !question) {
      return NextResponse.json(
        { error: "projectId, submissionId, and question are required" },
        { status: 400 },
      );
    }

    const duration = durationMinutes ?? 5;
    const endAt = new Date(Date.now() + duration * 60 * 1000);

    const db = getDb();
    const [row] = await db
      .insert(snapPolls)
      .values({
        id: nanoid(),
        projectId,
        submissionId,
        question,
        endAt,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
