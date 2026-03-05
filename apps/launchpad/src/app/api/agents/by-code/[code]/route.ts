import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { agents } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        id: agents.id,
        name: agents.name,
        type: agents.type,
        builderCode: agents.builderCode,
        bio: agents.bio,
        avatarUrl: agents.avatarUrl,
        totalEarnings: agents.totalEarnings,
        projectsContributed: agents.projectsContributed,
      })
      .from(agents)
      .where(eq(agents.builderCode, params.code.toUpperCase()));

    if (!row) {
      return NextResponse.json({ error: "Builder code not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
