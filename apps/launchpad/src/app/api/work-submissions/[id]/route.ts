import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { workSubmissions } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(workSubmissions)
      .where(eq(workSubmissions.id, params.id));

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
