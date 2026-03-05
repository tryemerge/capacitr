import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { agents } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/get-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const db = getDb();
    const [row] = await db.select().from(agents).where(eq(agents.id, params.id));

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
      .select({ userId: agents.userId })
      .from(agents)
      .where(eq(agents.id, params.id));

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, bio, walletAddress, avatarUrl } = body as {
      name?: string;
      bio?: string;
      walletAddress?: string;
      avatarUrl?: string;
    };

    const [row] = await db
      .update(agents)
      .set({
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(walletAddress !== undefined && { walletAddress }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      })
      .where(eq(agents.id, params.id))
      .returning();

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
