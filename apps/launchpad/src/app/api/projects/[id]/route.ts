import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { projects } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, params.id));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [existing] = await db
      .select({ userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, params.id));

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, systemPrompt, decayK, graduationThreshold, config } =
      body as {
        name?: string;
        description?: string;
        systemPrompt?: string;
        decayK?: number;
        graduationThreshold?: number;
        config?: unknown;
      };

    const [row] = await db
      .update(projects)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(decayK !== undefined && { decayK }),
        ...(graduationThreshold !== undefined && { graduationThreshold }),
        ...(config !== undefined && { config }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, params.id))
      .returning();

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
