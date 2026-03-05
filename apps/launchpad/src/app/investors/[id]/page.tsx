"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { InvestorTradePanel } from "@/components/InvestorTradePanel";
import { ETH_USD_PRICE } from "@/lib/constants";

interface Holding {
  projectId: string;
  projectName: string;
  symbol: string;
  balance: number;
  tokenPrice: number | null;
  valueETH: number;
  valueUSD: number;
}

interface WTokenHolding {
  projectId: string;
  projectName: string;
  symbol: string;
  balance: number;
}

interface InvestorPortfolio {
  id: string;
  name: string;
  ethBalance: number;
  ethBalanceUSD: number;
  totalTokenValueETH: number;
  totalTokenValueUSD: number;
  totalPortfolioUSD: number;
  holdings: Holding[];
  wTokenHoldings: WTokenHolding[];
}

interface ProjectOption {
  id: string;
  name: string;
  symbol: string;
  reserveETH: number;
  reserveToken: number;
}

function formatNum(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n < 0.001 && n > 0) return n.toExponential(2);
  return n.toFixed(4);
}

export default function InvestorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<InvestorPortfolio | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch(`/api/investors/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setPortfolio(data))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    refresh();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => setProjects([]));
    setLoading(false);
  }, [id, refresh]);

  if (loading) {
    return <div className="p-8 text-zinc-600 text-sm">Loading...</div>;
  }

  if (error || !portfolio) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">{error || "Investor not found"}</div>
        <Link href="/investors" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
          Back to Investors
        </Link>
      </div>
    );
  }

  const selectedProj = projects.find((p) => p.id === selectedProject);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{portfolio.name}</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-950 text-amber-400">
            investor
          </span>
        </div>
        <Link
          href="/investors"
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          All Investors
        </Link>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "ETH Balance", value: formatNum(portfolio.ethBalance), suffix: "ETH" },
          { label: "ETH (USD)", value: `$${portfolio.ethBalanceUSD.toLocaleString()}`, suffix: "" },
          { label: "Token Value", value: formatNum(portfolio.totalTokenValueETH), suffix: "ETH" },
          { label: "Total Portfolio", value: `$${portfolio.totalPortfolioUSD.toLocaleString()}`, suffix: "" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">{s.label}</div>
            <div className="text-sm font-mono text-zinc-100">
              {s.value}
              {s.suffix && <span className="text-[10px] text-zinc-500 ml-1">{s.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Token holdings */}
      {portfolio.holdings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Token Holdings</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left px-4 py-2 font-medium">Project</th>
                  <th className="text-right px-4 py-2 font-medium">Balance</th>
                  <th className="text-right px-4 py-2 font-medium">Price (ETH)</th>
                  <th className="text-right px-4 py-2 font-medium">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => (
                  <tr key={h.projectId} className="border-b border-zinc-800/50">
                    <td className="px-4 py-2">
                      <Link href={`/projects/${h.projectId}`} className="text-zinc-200 hover:text-indigo-400">
                        {h.projectName} <span className="text-zinc-500">${h.symbol}</span>
                      </Link>
                    </td>
                    <td className="text-right px-4 py-2 font-mono text-zinc-300">{formatNum(h.balance)}</td>
                    <td className="text-right px-4 py-2 font-mono text-zinc-400">{formatNum(h.tokenPrice)}</td>
                    <td className="text-right px-4 py-2 font-mono text-zinc-200">${h.valueUSD.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* wToken holdings */}
      {portfolio.wTokenHoldings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">wToken Holdings</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left px-4 py-2 font-medium">Project</th>
                  <th className="text-right px-4 py-2 font-medium">wToken Balance</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.wTokenHoldings.map((w) => (
                  <tr key={w.projectId} className="border-b border-zinc-800/50">
                    <td className="px-4 py-2">
                      <span className="text-zinc-200">{w.projectName}</span>
                      <span className="text-zinc-500 ml-1">w{w.symbol}</span>
                    </td>
                    <td className="text-right px-4 py-2 font-mono text-zinc-300">{formatNum(w.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Trade</h2>
        <div className="mb-3">
          <label className="block text-[10px] text-zinc-500 mb-1">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
          >
            <option value="">Choose a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.symbol})
              </option>
            ))}
          </select>
        </div>

        {selectedProj && (
          <InvestorTradePanel
            projectId={selectedProj.id}
            symbol={selectedProj.symbol}
            reserveETH={selectedProj.reserveETH}
            reserveToken={selectedProj.reserveToken}
            investorId={portfolio.id}
            investorName={portfolio.name}
            investorEthBalance={portfolio.ethBalance}
            onTrade={refresh}
          />
        )}
      </div>

      <div className="text-[9px] text-zinc-600 text-center">
        ETH/USD fixed at ${ETH_USD_PRICE.toLocaleString()}
      </div>
    </div>
  );
}
