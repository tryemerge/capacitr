"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AgentConfigForm } from "@/components/AgentConfigForm";

interface Project {
  id: string;
  name: string;
  symbol: string;
  wTokenPerBuy: number;
  wTokenPerReferralBuy: number;
}

export default function ConfigurePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [wTokenPerBuy, setWTokenPerBuy] = useState("");
  const [wTokenPerReferralBuy, setWTokenPerReferralBuy] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setWTokenPerBuy(String(data.wTokenPerBuy ?? 0));
        setWTokenPerReferralBuy(String(data.wTokenPerReferralBuy ?? 1));
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveWToken(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wTokenPerBuy: parseFloat(wTokenPerBuy) || 0,
          wTokenPerReferralBuy: parseFloat(wTokenPerReferralBuy) || 0,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">Project not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-indigo-400 text-xs hover:underline"
        >
          &larr; {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100 font-heading mt-2 mb-1">Configure</h1>
        <p className="text-zinc-400 text-sm">
          Agent and project settings for{" "}
          <span className="font-medium text-zinc-300">{project.name}</span> (${project.symbol}).
        </p>
      </div>

      {/* wToken Reward Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">wToken Rewards</h2>
        <p className="text-[10px] text-zinc-500 mb-4">
          Configure how many wTokens are earned per action. Set to 0 to disable.
        </p>
        <form onSubmit={handleSaveWToken} className="space-y-3">
          <div>
            <label className="block text-[10px] text-zinc-500 mb-1">wTokens per Token Purchase</label>
            <input
              type="text"
              inputMode="decimal"
              value={wTokenPerBuy}
              onChange={(e) => setWTokenPerBuy(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 font-mono focus:outline-none focus:border-zinc-700"
            />
            <p className="text-[9px] text-zinc-600 mt-1">Flat wToken reward when someone buys project tokens</p>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-1">wTokens per Referral Purchase</label>
            <input
              type="text"
              inputMode="decimal"
              value={wTokenPerReferralBuy}
              onChange={(e) => setWTokenPerReferralBuy(e.target.value)}
              placeholder="1"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 font-mono focus:outline-none focus:border-zinc-700"
            />
            <p className="text-[9px] text-zinc-600 mt-1">wTokens earned by the referrer when their referral buys</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save wToken Settings"}
            </button>
            {saved && <span className="text-emerald-400 text-xs">Saved</span>}
          </div>
        </form>
      </div>

      {/* Agent Config */}
      <AgentConfigForm projectId={id} />
    </div>
  );
}
