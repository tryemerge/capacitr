"use client";

import Link from "next/link";

interface ProjectCardProps {
  id: string;
  name: string;
  symbol: string;
  description?: string | null;
  status: string;
  tokenPrice: number | null;
  marketCap: number | null;
  totalVolume: number | null;
  contributorCount: number | null;
}

function formatNum(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function ProjectCard({
  id,
  name,
  symbol,
  description,
  status,
  tokenPrice,
  marketCap,
  totalVolume,
  contributorCount,
}: ProjectCardProps) {
  const graduationPct = Math.min(((marketCap ?? 0) / 69000) * 100, 100);

  return (
    <Link
      href={`/projects/${id}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-zinc-100 text-sm">{name}</h3>
          <span className="text-xs text-zinc-500 font-mono">${symbol}</span>
        </div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            status === "active"
              ? "bg-emerald-950 text-emerald-400"
              : status === "graduated"
                ? "bg-indigo-950 text-indigo-400"
                : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {status}
        </span>
      </div>

      {description && (
        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{description}</p>
      )}

      {/* Graduation progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
          <span>Graduation</span>
          <span>{graduationPct.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${graduationPct}%` }}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-[10px] text-zinc-500">Price</div>
          <div className="text-xs font-mono text-zinc-200">
            {formatNum(tokenPrice)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">MCap</div>
          <div className="text-xs font-mono text-zinc-200">
            {formatNum(marketCap)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">Vol</div>
          <div className="text-xs font-mono text-zinc-200">
            {formatNum(totalVolume)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">Builders</div>
          <div className="text-xs font-mono text-zinc-200">
            {contributorCount ?? 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
