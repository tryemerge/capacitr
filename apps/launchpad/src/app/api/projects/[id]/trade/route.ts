import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import { projects, trades, tokenBalances, wTokenBalances, agents, referrals } from "@capacitr/database/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { nanoid } from "nanoid";
import {
  createBondingCurve,
  buyToken,
  sellToken,
  spotPrice,
  marketCap,
} from "@/lib/emitter";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(req.headers);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { side, amount, referrerCode } = body as {
      side: string;
      amount: number;
      referrerCode?: string;
    };

    if (!["buy", "sell"].includes(side)) {
      return NextResponse.json(
        { error: "side must be 'buy' or 'sell'" },
        { status: 400 },
      );
    }
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    const db = getDb();

    // Read current project state
    const [project] = await db
      .select({
        reserveETH: projects.reserveETH,
        reserveToken: projects.reserveToken,
        totalSupply: projects.totalSupply,
        totalVolume: projects.totalVolume,
        workPoolValue: projects.workPoolValue,
        wTokenPerBuy: projects.wTokenPerBuy,
        wTokenPerReferralBuy: projects.wTokenPerReferralBuy,
      })
      .from(projects)
      .where(eq(projects.id, params.id));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const state = createBondingCurve(project.reserveETH, project.reserveToken);

    // For sells, check the user has enough tokens
    if (side === "sell") {
      const [bal] = await db
        .select({ balance: tokenBalances.balance })
        .from(tokenBalances)
        .where(
          and(
            eq(tokenBalances.userId, session.user.id),
            eq(tokenBalances.projectId, params.id),
          ),
        );

      if (!bal || bal.balance < amount) {
        return NextResponse.json(
          { error: "Insufficient token balance" },
          { status: 400 },
        );
      }
    }

    // Execute trade math
    const result = side === "buy" ? buyToken(state, amount) : sellToken(state, amount);
    const newPrice = spotPrice(result.newState);
    const newMarketCap = marketCap(result.newState, project.totalSupply);
    const volumeAdd = side === "buy" ? amount : result.ethTraded;

    // Persist everything in a transaction
    await db.transaction(async (tx) => {
      // Update project reserves + aggregates
      await tx
        .update(projects)
        .set({
          reserveETH: result.newState.reserveETH,
          reserveToken: result.newState.reserveToken,
          tokenPrice: newPrice,
          marketCap: newMarketCap,
          totalVolume: (project.totalVolume ?? 0) + volumeAdd,
          workPoolValue: (project.workPoolValue ?? 0) + result.workPoolFee,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, params.id));

      // Insert trade record
      await tx.insert(trades).values({
        id: nanoid(),
        projectId: params.id,
        userId: session.user.id,
        side,
        amountIn: side === "buy" ? amount : result.tokensTraded,
        amountOut: side === "buy" ? result.tokensTraded : result.ethTraded,
        fee: result.fee,
        creatorFee: result.creatorFee,
        protocolFee: result.protocolFee,
        workPoolFee: result.workPoolFee,
        priceAfter: newPrice,
      });

      // Upsert token balance
      const [existing] = await tx
        .select({ id: tokenBalances.id, balance: tokenBalances.balance })
        .from(tokenBalances)
        .where(
          and(
            eq(tokenBalances.userId, session.user.id),
            eq(tokenBalances.projectId, params.id),
          ),
        );

      const delta = side === "buy" ? result.tokensTraded : -result.tokensTraded;

      if (existing) {
        await tx
          .update(tokenBalances)
          .set({
            balance: existing.balance + delta,
            updatedAt: new Date(),
          })
          .where(eq(tokenBalances.id, existing.id));
      } else {
        await tx.insert(tokenBalances).values({
          id: nanoid(),
          userId: session.user.id,
          projectId: params.id,
          balance: delta,
        });
      }

      // wToken credit on buy
      if (side === "buy" && project.wTokenPerBuy > 0) {
        const [existingW] = await tx
          .select({ id: wTokenBalances.id, balance: wTokenBalances.balance })
          .from(wTokenBalances)
          .where(
            and(
              eq(wTokenBalances.userId, session.user.id),
              eq(wTokenBalances.projectId, params.id),
            ),
          );

        if (existingW) {
          await tx
            .update(wTokenBalances)
            .set({ balance: existingW.balance + project.wTokenPerBuy, updatedAt: new Date() })
            .where(eq(wTokenBalances.id, existingW.id));
        } else {
          await tx.insert(wTokenBalances).values({
            id: nanoid(),
            userId: session.user.id,
            projectId: params.id,
            balance: project.wTokenPerBuy,
          });
        }
      }

      // Referral wToken credit
      if (referrerCode && side === "buy" && project.wTokenPerReferralBuy > 0) {
        const [agent] = await tx
          .select({ userId: agents.userId })
          .from(agents)
          .where(eq(agents.builderCode, referrerCode.toUpperCase()));

        if (agent) {
          const [existingRef] = await tx
            .select({ id: wTokenBalances.id, balance: wTokenBalances.balance })
            .from(wTokenBalances)
            .where(
              and(
                eq(wTokenBalances.userId, agent.userId),
                eq(wTokenBalances.projectId, params.id),
              ),
            );

          if (existingRef) {
            await tx
              .update(wTokenBalances)
              .set({ balance: existingRef.balance + project.wTokenPerReferralBuy, updatedAt: new Date() })
              .where(eq(wTokenBalances.id, existingRef.id));
          } else {
            await tx.insert(wTokenBalances).values({
              id: nanoid(),
              userId: agent.userId,
              projectId: params.id,
              balance: project.wTokenPerReferralBuy,
            });
          }

          await tx.insert(referrals).values({
            id: nanoid(),
            projectId: params.id,
            referrerCode: referrerCode.toUpperCase(),
            refereeAddress: session.user.id,
            wTokensMinted: project.wTokenPerReferralBuy,
          });
        }
      }
    });

    return NextResponse.json({
      side,
      amountIn: side === "buy" ? amount : result.tokensTraded,
      amountOut: side === "buy" ? result.tokensTraded : result.ethTraded,
      fee: result.fee,
      priceAfter: newPrice,
      marketCap: newMarketCap,
      reserveETH: result.newState.reserveETH,
      reserveToken: result.newState.reserveToken,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
