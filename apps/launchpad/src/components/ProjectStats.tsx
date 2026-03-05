"use client";

interface ProjectStatsProps {
  tokenPrice: number | null;
  marketCap: number | null;
  totalVolume: number | null;
  workPoolValue: number | null;
  contributorCount: number | null;
}

function formatNum(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n < 0.001 && n > 0) return n.toExponential(2);
  return n.toFixed(4);
}

export function ProjectStats({
  tokenPrice,
  marketCap,
  totalVolume,
  workPoolValue,
  contributorCount,
}: ProjectStatsProps) {
  const stats = [
    { label: "Price", value: formatNum(tokenPrice), suffix: "ETH" },
    { label: "Market Cap", value: formatNum(marketCap), suffix: "ETH" },
    { label: "Volume", value: formatNum(totalVolume), suffix: "ETH" },
    { label: "Work Pool", value: formatNum(workPoolValue), suffix: "ETH" },
    { label: "Builders", value: String(contributorCount ?? 0), suffix: "" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        >
          <div className="text-[10px] text-zinc-500 mb-1">{s.label}</div>
          <div className="text-sm font-mono text-zinc-100">
            {s.value}
            {s.suffix && (
              <span className="text-[10px] text-zinc-500 ml-1">{s.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
