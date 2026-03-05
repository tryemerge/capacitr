"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BondingCurveChart } from "@/components/BondingCurveChart";
import { TokenTradePanel } from "@/components/TokenTradePanel";
import { ProjectStats } from "@/components/ProjectStats";
import { SnapPollCard } from "@/components/SnapPollCard";

interface SnapPoll {
  id: string;
  question: string;
  status: string;
  endAt: string;
  yesWeight: number;
  noWeight: number;
  outcome: string | null;
}

interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  systemPrompt: string;
  decayK: number;
  graduationThreshold: number;
  status: string;
  reserveETH: number;
  reserveToken: number;
  totalSupply: number;
  tokenPrice: number | null;
  marketCap: number | null;
  totalVolume: number | null;
  workPoolValue: number | null;
  contributorCount: number | null;
  createdAt: string;
}

function formatNum(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(4);
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [polls, setPolls] = useState<SnapPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProject = useCallback(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setProject(data))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    refreshProject();
    setLoading(false);

    fetch(`/api/snap-polls?projectId=${id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPolls(data); })
      .catch(() => setPolls([]));
  }, [id, refreshProject]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-zinc-600 text-sm">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">{error || "Project not found"}</div>
        <Link href="/" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const graduationPct = Math.min(
    ((project.marketCap ?? 0) / project.graduationThreshold) * 100,
    100,
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
            <span className="text-sm text-zinc-500 font-mono">${project.symbol}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                project.status === "active"
                  ? "bg-emerald-950 text-emerald-400"
                  : project.status === "graduated"
                    ? "bg-indigo-950 text-indigo-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-zinc-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/submit/${project.id}`}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Submit Work
          </Link>
          <Link
            href={`/projects/${project.id}/configure`}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Configure
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-6">
        <ProjectStats
          tokenPrice={project.tokenPrice}
          marketCap={project.marketCap}
          totalVolume={project.totalVolume}
          workPoolValue={project.workPoolValue}
          contributorCount={project.contributorCount}
        />
      </div>

      {/* Graduation progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-2">
          <span>Graduation Progress</span>
          <span>
            {formatNum(project.marketCap)} / {formatNum(project.graduationThreshold)}
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${graduationPct}%` }}
          />
        </div>
      </div>

      {/* Trading + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <BondingCurveChart />
        <TokenTradePanel
          projectId={project.id}
          symbol={project.symbol}
          reserveETH={project.reserveETH}
          reserveToken={project.reserveToken}
          onTrade={refreshProject}
        />
      </div>

      {/* Snap Polls */}
      {polls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Snap Polls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {polls.map((poll) => (
              <SnapPollCard key={poll.id} {...poll} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
