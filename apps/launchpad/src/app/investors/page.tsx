"use client";

import { useState, useEffect } from "react";
import { InvestorCard } from "@/components/InvestorCard";

interface Investor {
  id: string;
  name: string;
  ethBalance: number;
  createdAt: string;
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [ethBalance, setEthBalance] = useState("100");
  const [creating, setCreating] = useState(false);

  function refresh() {
    fetch("/api/investors")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setInvestors(data); })
      .catch(() => setInvestors([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ethBalance: parseFloat(ethBalance) || 100 }),
      });

      if (res.ok) {
        setName("");
        setEthBalance("100");
        refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Investors</h1>
      <p className="text-sm text-zinc-500 mb-6">Seeded test accounts for simulating market activity</p>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-[10px] text-zinc-500 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alice Chen"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <div className="w-32">
          <label className="block text-[10px] text-zinc-500 mb-1">Starting ETH</label>
          <input
            type="text"
            inputMode="decimal"
            value={ethBalance}
            onChange={(e) => setEthBalance(e.target.value)}
            placeholder="100"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 font-mono focus:outline-none focus:border-zinc-700"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Add Investor"}
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="text-zinc-600 text-sm">Loading investors...</div>
      ) : investors.length === 0 ? (
        <div className="text-zinc-600 text-sm">No investors yet. Create one above.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {investors.map((inv) => (
            <InvestorCard key={inv.id} {...inv} />
          ))}
        </div>
      )}
    </div>
  );
}
