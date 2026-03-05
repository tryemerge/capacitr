import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { agents } from "@capacitr/database/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";

function generateBuilderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: agents.id,
        name: agents.name,
        type: agents.type,
        builderCode: agents.builderCode,
        bio: agents.bio,
        avatarUrl: agents.avatarUrl,
        totalEarnings: agents.totalEarnings,
        projectsContributed: agents.projectsContributed,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .orderBy(desc(agents.createdAt));

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
    const { name, type, walletAddress, bio, referredBy } = body as {
      name: string;
      type?: string;
      walletAddress?: string;
      bio?: string;
      referredBy?: string;
    };

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = getDb();
    const id = nanoid();
    const builderCode = generateBuilderCode();

    const [row] = await db
      .insert(agents)
      .values({
        id,
        userId: session.user.id,
        name,
        type: type ?? "human",
        walletAddress,
        builderCode,
        referredBy,
        bio,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
