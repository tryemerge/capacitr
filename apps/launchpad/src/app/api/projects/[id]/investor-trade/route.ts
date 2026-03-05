import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@capacitr/database";
import {
  projects,
  trades,
  investors,
  investorTokenBalances,
  wTokenBalances,
  referrals,
  agents,
} from "@capacitr/database/schema";
import { eq, and } from "drizzle-orm";
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
    const body = await req.json();
    const { investorId, side, amount, referrerCode } = body as {
      investorId: string;
      side: string;
      amount: number;
      referrerCode?: string;
    };

    if (!investorId) {
      return NextResponse.json({ error: "investorId is required" }, { status: 400 });
    }
    if (!["buy", "sell"].includes(side)) {
      return NextResponse.json({ error: "side must be 'buy' or 'sell'" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const db = getDb();

    // Verify investor
    const [investor] = await db
      .select()
      .from(investors)
      .where(eq(investors.id, investorId));

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    // Read project state
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

    // Balance checks
    if (side === "buy" && investor.ethBalance < amount) {
      return NextResponse.json({ error: "Insufficient ETH balance" }, { status: 400 });
    }

    if (side === "sell") {
      const [bal] = await db
        .select({ balance: investorTokenBalances.balance })
        .from(investorTokenBalances)
        .where(
          and(
            eq(investorTokenBalances.investorId, investorId),
            eq(investorTokenBalances.projectId, params.id),
          ),
        );

      if (!bal || bal.balance < amount) {
        return NextResponse.json({ error: "Insufficient token balance" }, { status: 400 });
      }
    }

    // Execute trade math
    const state = createBondingCurve(project.reserveETH, project.reserveToken);
    const result = side === "buy" ? buyToken(state, amount) : sellToken(state, amount);
    const newPrice = spotPrice(result.newState);
    const newMarketCap = marketCap(result.newState, project.totalSupply);
    const volumeAdd = side === "buy" ? amount : result.ethTraded;

    // Resolve referrer if provided
    let referrerUserId: string | null = null;
    if (referrerCode && side === "buy") {
      const [agent] = await db
        .select({ userId: agents.userId })
        .from(agents)
        .where(eq(agents.builderCode, referrerCode.toUpperCase()));
      if (agent) referrerUserId = agent.userId;
    }

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

      // Update investor ETH balance
      const ethDelta = side === "buy" ? -amount : result.ethTraded;
      await tx
        .update(investors)
        .set({ ethBalance: investor.ethBalance + ethDelta })
        .where(eq(investors.id, investorId));

      // Insert trade record
      await tx.insert(trades).values({
        id: nanoid(),
        projectId: params.id,
        investorId,
        side,
        amountIn: side === "buy" ? amount : result.tokensTraded,
        amountOut: side === "buy" ? result.tokensTraded : result.ethTraded,
        fee: result.fee,
        creatorFee: result.creatorFee,
        protocolFee: result.protocolFee,
        workPoolFee: result.workPoolFee,
        priceAfter: newPrice,
      });

      // Upsert investor token balance
      const [existing] = await tx
        .select({ id: investorTokenBalances.id, balance: investorTokenBalances.balance })
        .from(investorTokenBalances)
        .where(
          and(
            eq(investorTokenBalances.investorId, investorId),
            eq(investorTokenBalances.projectId, params.id),
          ),
        );

      const tokenDelta = side === "buy" ? result.tokensTraded : -result.tokensTraded;

      if (existing) {
        await tx
          .update(investorTokenBalances)
          .set({ balance: existing.balance + tokenDelta, updatedAt: new Date() })
          .where(eq(investorTokenBalances.id, existing.id));
      } else {
        await tx.insert(investorTokenBalances).values({
          id: nanoid(),
          investorId,
          projectId: params.id,
          balance: tokenDelta,
        });
      }

      // wToken credit on buy
      if (side === "buy" && project.wTokenPerBuy > 0) {
        const [existingW] = await tx
          .select({ id: wTokenBalances.id, balance: wTokenBalances.balance })
          .from(wTokenBalances)
          .where(
            and(
              eq(wTokenBalances.investorId, investorId),
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
            investorId,
            projectId: params.id,
            balance: project.wTokenPerBuy,
          });
        }
      }

      // Referral wToken credit
      if (referrerUserId && side === "buy" && project.wTokenPerReferralBuy > 0) {
        const [existingRef] = await tx
          .select({ id: wTokenBalances.id, balance: wTokenBalances.balance })
          .from(wTokenBalances)
          .where(
            and(
              eq(wTokenBalances.userId, referrerUserId),
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
            userId: referrerUserId,
            projectId: params.id,
            balance: project.wTokenPerReferralBuy,
          });
        }

        // Audit trail
        await tx.insert(referrals).values({
          id: nanoid(),
          projectId: params.id,
          referrerCode: referrerCode!.toUpperCase(),
          refereeAddress: investorId,
          wTokensMinted: project.wTokenPerReferralBuy,
        });
      }
    });

    return NextResponse.json({
      side,
      amountIn: side === "buy" ? amount : result.tokensTraded,
      amountOut: side === "buy" ? result.tokensTraded : result.ethTraded,
      fee: result.fee,
      priceAfter: newPrice,
      marketCap: newMarketCap,
      newEthBalance: investor.ethBalance + (side === "buy" ? -amount : result.ethTraded),
    });
  } catch (err) {
    console.error("[POST /api/projects/[id]/investor-trade]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
