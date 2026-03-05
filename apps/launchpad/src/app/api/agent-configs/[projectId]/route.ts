import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { agentConfigs, projects } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(agentConfigs)
      .where(eq(agentConfigs.projectId, params.projectId));

    if (!row) {
      return NextResponse.json({ error: "No config found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const db = getDb();
    const [project] = await db
      .select({ userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, params.projectId));

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      systemPrompt,
      autoApproveThreshold,
      autoRejectThreshold,
      snapPollDurationMinutes,
      maxTokenAsk,
    } = body as {
      systemPrompt?: string;
      autoApproveThreshold?: number;
      autoRejectThreshold?: number;
      snapPollDurationMinutes?: number;
      maxTokenAsk?: number;
    };

    // Upsert
    const existing = await db
      .select({ id: agentConfigs.id })
      .from(agentConfigs)
      .where(eq(agentConfigs.projectId, params.projectId));

    let row;
    if (existing.length > 0) {
      [row] = await db
        .update(agentConfigs)
        .set({
          ...(systemPrompt !== undefined && { systemPrompt }),
          ...(autoApproveThreshold !== undefined && { autoApproveThreshold }),
          ...(autoRejectThreshold !== undefined && { autoRejectThreshold }),
          ...(snapPollDurationMinutes !== undefined && { snapPollDurationMinutes }),
          ...(maxTokenAsk !== undefined && { maxTokenAsk }),
          updatedAt: new Date(),
        })
        .where(eq(agentConfigs.projectId, params.projectId))
        .returning();
    } else {
      [row] = await db
        .insert(agentConfigs)
        .values({
          id: nanoid(),
          projectId: params.projectId,
          systemPrompt: systemPrompt ?? "",
          autoApproveThreshold,
          autoRejectThreshold,
          snapPollDurationMinutes,
          maxTokenAsk,
        })
        .returning();
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
