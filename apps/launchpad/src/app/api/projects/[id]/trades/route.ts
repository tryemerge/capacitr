import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { trades } from "@capacitr/database/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: trades.id,
        side: trades.side,
        amountIn: trades.amountIn,
        amountOut: trades.amountOut,
        fee: trades.fee,
        priceAfter: trades.priceAfter,
        createdAt: trades.createdAt,
      })
      .from(trades)
      .where(eq(trades.projectId, params.id))
      .orderBy(desc(trades.createdAt))
      .limit(50);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
