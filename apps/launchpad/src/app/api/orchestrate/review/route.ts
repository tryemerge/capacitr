import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { workSubmissions, projects, agentConfigs } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { reviewSubmission } from "@/lib/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { submissionId } = body as { submissionId: string };

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const db = getDb();

    // Get submission
    const [submission] = await db
      .select()
      .from(workSubmissions)
      .where(eq(workSubmissions.id, submissionId));

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Get project + config
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, submission.projectId));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [config] = await db
      .select()
      .from(agentConfigs)
      .where(eq(agentConfigs.projectId, submission.projectId));

    // Run orchestrator review
    const result = await reviewSubmission({
      systemPrompt: config?.systemPrompt ?? project.systemPrompt,
      proofContent: submission.proofContent,
      tokenAsk: submission.tokenAsk,
      maxTokenAsk: config?.maxTokenAsk ?? undefined,
      autoApproveThreshold: config?.autoApproveThreshold ?? undefined,
      autoRejectThreshold: config?.autoRejectThreshold ?? undefined,
    });

    // Update submission with result
    const [updated] = await db
      .update(workSubmissions)
      .set({
        status: result.decision,
        reviewedBy: "orchestrator",
        reviewNotes: `[${result.confidence.toFixed(2)}] ${result.reasoning}`,
        updatedAt: new Date(),
      })
      .where(eq(workSubmissions.id, submissionId))
      .returning();

    return NextResponse.json({ submission: updated, review: result });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
