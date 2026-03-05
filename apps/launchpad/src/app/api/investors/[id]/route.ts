import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDb } from "@capacitr/database";
import {
  investors,
  investorTokenBalances,
  wTokenBalances,
  projects,
} from "@capacitr/database/schema";
import { eq, and } from "drizzle-orm";
import { ETH_USD_PRICE } from "@/lib/constants";
import { getSession } from "@/lib/get-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    const [investor] = await db
      .select()
      .from(investors)
      .where(and(eq(investors.id, params.id), eq(investors.userId, session.user.id)));

    if (!investor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Token holdings with project info for price
    const holdings = await db
      .select({
        projectId: investorTokenBalances.projectId,
        balance: investorTokenBalances.balance,
        projectName: projects.name,
        symbol: projects.symbol,
        tokenPrice: projects.tokenPrice,
      })
      .from(investorTokenBalances)
      .innerJoin(projects, eq(investorTokenBalances.projectId, projects.id))
      .where(eq(investorTokenBalances.investorId, params.id));

    // wToken holdings
    const wHoldings = await db
      .select({
        projectId: wTokenBalances.projectId,
        balance: wTokenBalances.balance,
        projectName: projects.name,
        symbol: projects.symbol,
      })
      .from(wTokenBalances)
      .innerJoin(projects, eq(wTokenBalances.projectId, projects.id))
      .where(eq(wTokenBalances.investorId, params.id));

    const holdingsWithUsd = holdings.map((h) => {
      const valueETH = h.balance * (h.tokenPrice ?? 0);
      return {
        ...h,
        valueETH,
        valueUSD: valueETH * ETH_USD_PRICE,
      };
    });

    const totalTokenValueETH = holdingsWithUsd.reduce((sum, h) => sum + h.valueETH, 0);

    return NextResponse.json({
      ...investor,
      ethBalanceUSD: investor.ethBalance * ETH_USD_PRICE,
      totalTokenValueETH,
      totalTokenValueUSD: totalTokenValueETH * ETH_USD_PRICE,
      totalPortfolioUSD: (investor.ethBalance + totalTokenValueETH) * ETH_USD_PRICE,
      holdings: holdingsWithUsd,
      wTokenHoldings: wHoldings,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
