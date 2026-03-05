"use client";

import { useState, useEffect } from "react";
import { WorkerDashboard } from "@/components/WorkerDashboard";

interface Agent {
  id: string;
  name: string;
  builderCode: string;
  totalEarnings: number;
}

interface WorkSubmission {
  id: string;
  projectId: string;
  tokenAsk: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agent profile and submissions
    Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/work-submissions").then((r) => r.json()),
    ])
      .then(([agents, subs]) => {
        // Use first agent (current user's)
        if (agents.length > 0) setAgent(agents[0]);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-zinc-600 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  // Build mock positions from approved submissions
  const approvedSubs = submissions.filter((s) => s.status === "approved");
  const positionMap = new Map<
    string,
    { balance: number; projectId: string }
  >();

  for (const sub of approvedSubs) {
    const existing = positionMap.get(sub.projectId);
    if (existing) {
      existing.balance += sub.tokenAsk;
    } else {
      positionMap.set(sub.projectId, {
        balance: sub.tokenAsk,
        projectId: sub.projectId,
      });
    }
  }

  const positions = Array.from(positionMap.values()).map((pos) => ({
    projectId: pos.projectId,
    projectName: pos.projectId, // Would be resolved from project data
    symbol: "TKN",
    balance: pos.balance,
    unlockAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    estimatedValue: pos.balance * 0.00001, // Mock value
  }));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Your wToken earnings, balances, and lock timers.
      </p>

      {agent && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-200">{agent.name}</div>
              <div className="text-xs text-zinc-500">Builder Code</div>
            </div>
            <div className="text-lg font-mono font-bold text-indigo-400 tracking-widest">
              {agent.builderCode}
            </div>
          </div>
        </div>
      )}

      <WorkerDashboard
        positions={positions}
        totalEarnings={agent?.totalEarnings ?? 0}
      />

      {/* Recent submissions */}
      {submissions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Recent Submissions
          </h2>
          <div className="space-y-1">
            {submissions.slice(0, 10).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/50"
              >
                <span className="text-zinc-400 font-mono">
                  {sub.projectId.slice(0, 12)}...
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">
                    {sub.tokenAsk} tokens
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      sub.status === "approved"
                        ? "bg-emerald-950 text-emerald-400"
                        : sub.status === "rejected"
                          ? "bg-red-950 text-red-400"
                          : sub.status === "snap_poll"
                            ? "bg-amber-950 text-amber-400"
                            : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
