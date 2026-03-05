import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { investors } from "@capacitr/database/schema";
import { asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: investors.id,
        name: investors.name,
        ethBalance: investors.ethBalance,
        createdAt: investors.createdAt,
      })
      .from(investors)
      .orderBy(asc(investors.name));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ethBalance } = body as { name: string; ethBalance?: number };

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = getDb();
    const [row] = await db
      .insert(investors)
      .values({ id: nanoid(), name, ethBalance: ethBalance ?? 100 })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
