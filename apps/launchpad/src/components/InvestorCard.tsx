"use client";

import Link from "next/link";
import { ETH_USD_PRICE } from "@/lib/constants";

interface InvestorCardProps {
  id: string;
  name: string;
  ethBalance: number;
}

export function InvestorCard({ id, name, ethBalance }: InvestorCardProps) {
  return (
    <Link
      href={`/investors/${id}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-zinc-100 text-sm">{name}</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-950 text-amber-400">
          investor
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-[10px] text-zinc-500">ETH Balance</div>
          <div className="text-xs font-mono text-zinc-200">{ethBalance.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">USD Value</div>
          <div className="text-xs font-mono text-zinc-200">
            ${(ethBalance * ETH_USD_PRICE).toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
