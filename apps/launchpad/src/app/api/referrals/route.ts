import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { referrals, agents } from "@capacitr/database/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "code query param required" }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerCode, code.toUpperCase()));

    const totalMinted = rows.reduce((sum, r) => sum + (r.wTokensMinted ?? 0), 0);

    return NextResponse.json({ referrals: rows, totalMinted, count: rows.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req.headers);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { projectId, referrerCode, refereeAddress, purchaseTxHash } = body as {
      projectId: string;
      referrerCode: string;
      refereeAddress: string;
      purchaseTxHash?: string;
    };

    if (!projectId || !referrerCode || !refereeAddress) {
      return NextResponse.json(
        { error: "projectId, referrerCode, and refereeAddress are required" },
        { status: 400 },
      );
    }

    // Verify the referrer code exists
    const db = getDb();
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.builderCode, referrerCode.toUpperCase()));

    if (!agent) {
      return NextResponse.json({ error: "Invalid referrer code" }, { status: 404 });
    }

    const [row] = await db
      .insert(referrals)
      .values({
        id: nanoid(),
        projectId,
        referrerCode: referrerCode.toUpperCase(),
        refereeAddress,
        purchaseTxHash,
        wTokensMinted: 1, // 1 wToken per referral purchase
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
