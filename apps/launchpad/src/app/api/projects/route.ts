import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { projects } from "@capacitr/database/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";
import { createBondingCurve, spotPrice } from "@/lib/emitter";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        symbol: projects.symbol,
        description: projects.description,
        status: projects.status,
        tokenPrice: projects.tokenPrice,
        marketCap: projects.marketCap,
        totalVolume: projects.totalVolume,
        workPoolValue: projects.workPoolValue,
        contributorCount: projects.contributorCount,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt));

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
    const { name, symbol, description, systemPrompt, decayK, graduationThreshold } =
      body as {
        name: string;
        symbol: string;
        description?: string;
        systemPrompt: string;
        decayK?: number;
        graduationThreshold?: number;
      };

    if (!name || !symbol || !systemPrompt) {
      return NextResponse.json(
        { error: "name, symbol, and systemPrompt are required" },
        { status: 400 },
      );
    }

    const db = getDb();
    const id = nanoid();

    const initialETH = 10;
    const initialTokens = 1_000_000;
    const initialState = createBondingCurve(initialETH, initialTokens);
    const initialPrice = spotPrice(initialState);

    const [row] = await db
      .insert(projects)
      .values({
        id,
        userId: session.user.id,
        name,
        symbol: symbol.toUpperCase(),
        description,
        systemPrompt,
        decayK: decayK ?? 0.002,
        graduationThreshold: graduationThreshold ?? 69000,
        reserveETH: initialETH,
        reserveToken: initialTokens,
        totalSupply: initialTokens,
        tokenPrice: initialPrice,
        marketCap: initialPrice * initialTokens,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
