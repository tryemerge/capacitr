import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { projects } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        tokenPrice: projects.tokenPrice,
        marketCap: projects.marketCap,
        totalVolume: projects.totalVolume,
        workPoolValue: projects.workPoolValue,
        contributorCount: projects.contributorCount,
        status: projects.status,
      })
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
