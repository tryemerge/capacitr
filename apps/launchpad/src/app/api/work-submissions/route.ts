import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { workSubmissions, agents } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");

    const db = getDb();
    let query = db
      .select({
        id: workSubmissions.id,
        projectId: workSubmissions.projectId,
        agentId: workSubmissions.agentId,
        proofContent: workSubmissions.proofContent,
        tokenAsk: workSubmissions.tokenAsk,
        status: workSubmissions.status,
        reviewNotes: workSubmissions.reviewNotes,
        createdAt: workSubmissions.createdAt,
      })
      .from(workSubmissions)
      .orderBy(desc(workSubmissions.createdAt))
      .$dynamic();

    if (projectId) {
      query = query.where(eq(workSubmissions.projectId, projectId));
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
    const { projectId, proofContent, tokenAsk, assets } = body as {
      projectId: string;
      proofContent: string;
      tokenAsk: number;
      assets?: unknown;
    };

    if (!projectId || !proofContent || tokenAsk == null) {
      return NextResponse.json(
        { error: "projectId, proofContent, and tokenAsk are required" },
        { status: 400 },
      );
    }

    // Look up the agent for this user
    const db = getDb();
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, session.user.id));

    if (!agent) {
      return NextResponse.json(
        { error: "You must register as a builder first" },
        { status: 403 },
      );
    }

    const [row] = await db
      .insert(workSubmissions)
      .values({
        id: nanoid(),
        projectId,
        agentId: agent.id,
        proofContent,
        tokenAsk,
        assets,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
