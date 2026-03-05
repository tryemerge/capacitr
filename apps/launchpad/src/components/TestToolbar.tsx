"use client";

import { useState, useEffect, useCallback } from "react";
import { ETH_USD_PRICE } from "@/lib/constants";

interface Investor {
  id: string;
  name: string;
  ethBalance: number;
}

interface Agent {
  id: string;
  name: string;
  builderCode: string;
}

interface Project {
  id: string;
  name: string;
  symbol: string;
}

export function TestToolbar() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"investor" | "agent">("investor");

  const [investors, setInvestors] = useState<Investor[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [referrerCode, setReferrerCode] = useState("");

  const [trading, setTrading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const loadData = useCallback(() => {
    fetch("/api/investors").then((r) => r.json()).then(setInvestors).catch(() => {});
    fetch("/api/agents").then((r) => r.json()).then(setAgents).catch(() => {});
    fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) loadData();
  }, [open, loadData]);

  const activeInvestor = investors.find((i) => i.id === selectedInvestor);
  const activeAgent = agents.find((a) => a.id === selectedAgent);
  const activeProject = projects.find((p) => p.id === selectedProject);

  async function executeTrade() {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !selectedProject) return;

    setTrading(true);
    setResult(null);

    try {
      if (tab === "investor") {
        if (!selectedInvestor) return;
        const res = await fetch(`/api/projects/${selectedProject}/investor-trade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investorId: selectedInvestor,
            side,
            amount: val,
            ...(referrerCode && { referrerCode }),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Trade failed");
        setResult(
          `${side === "buy" ? "Bought" : "Sold"} ${data.trade?.tokensTraded?.toFixed(2) ?? val} ${activeProject?.symbol ?? "tokens"}`,
        );
      } else {
        // Agent trade uses the auth trade route — we can't impersonate directly.
        // Instead show agent's builder code for referral testing.
        setResult("Agent trades require auth session. Use referrer code instead.");
      }

      setAmount("");
      loadData();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setTrading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-amber-600 text-white text-lg font-bold shadow-lg hover:bg-amber-500 transition-colors flex items-center justify-center"
        title="Test Toolbar"
      >
        T
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">Test Toolbar</span>
            <button onClick={loadData} className="text-[10px] text-zinc-500 hover:text-zinc-300">
              refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setTab("investor")}
              className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                tab === "investor" ? "text-amber-400 border-b border-amber-400" : "text-zinc-500"
              }`}
            >
              Investor ({investors.length})
            </button>
            <button
              onClick={() => setTab("agent")}
              className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                tab === "agent" ? "text-amber-400 border-b border-amber-400" : "text-zinc-500"
              }`}
            >
              Agent ({agents.length})
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Entity selector */}
            {tab === "investor" ? (
              <div>
                <label className="block text-[9px] text-zinc-500 mb-1">Investor</label>
                <select
                  value={selectedInvestor}
                  onChange={(e) => setSelectedInvestor(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="">Select...</option>
                  {investors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} — {inv.ethBalance.toFixed(2)} ETH (${(inv.ethBalance * ETH_USD_PRICE).toLocaleString()})
                    </option>
                  ))}
                </select>
                {activeInvestor && (
                  <div className="mt-1 text-[9px] text-zinc-500">
                    Balance: {activeInvestor.ethBalance.toFixed(4)} ETH / ${(activeInvestor.ethBalance * ETH_USD_PRICE).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-[9px] text-zinc-500 mb-1">Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="">Select...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.builderCode})
                    </option>
                  ))}
                </select>
                {activeAgent && (
                  <div className="mt-1 text-[9px] text-zinc-500">
                    Builder code: <span className="font-mono text-zinc-300">{activeAgent.builderCode}</span>
                    <button
                      onClick={() => {
                        setReferrerCode(activeAgent.builderCode);
                        setTab("investor");
                      }}
                      className="ml-2 text-amber-500 hover:text-amber-400"
                    >
                      use as referrer →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Project selector */}
            <div>
              <label className="block text-[9px] text-zinc-500 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
              >
                <option value="">Select...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Trade controls */}
            {tab === "investor" && selectedInvestor && selectedProject && (
              <>
                <div className="flex gap-1 bg-zinc-800/50 rounded p-0.5">
                  <button
                    onClick={() => setSide("buy")}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                      side === "buy" ? "bg-emerald-600 text-white" : "text-zinc-400"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide("sell")}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                      side === "sell" ? "bg-red-600 text-white" : "text-zinc-400"
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">
                    {side === "buy" ? "ETH Amount" : `${activeProject?.symbol ?? "Token"} Amount`}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none"
                    />
                    {side === "buy" && (
                      <div className="flex gap-0.5">
                        {["0.1", "1", "5"].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAmount(v)}
                            className="px-1.5 py-1 text-[9px] bg-zinc-800 text-zinc-400 rounded hover:text-zinc-200"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Referrer code */}
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">Referrer Code (optional)</label>
                  <input
                    type="text"
                    value={referrerCode}
                    onChange={(e) => setReferrerCode(e.target.value)}
                    placeholder="e.g. ABC123"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none"
                  />
                </div>

                <button
                  onClick={executeTrade}
                  disabled={trading || !amount}
                  className={`w-full py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                    side === "buy"
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {trading ? "Trading..." : `${side === "buy" ? "Buy" : "Sell"} as ${activeInvestor?.name ?? "investor"}`}
                </button>
              </>
            )}

            {/* Result */}
            {result && (
              <div className={`text-[10px] px-2 py-1.5 rounded ${
                result.includes("fail") || result.includes("error") || result.includes("require")
                  ? "bg-red-950 text-red-400"
                  : "bg-emerald-950 text-emerald-400"
              }`}>
                {result}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
