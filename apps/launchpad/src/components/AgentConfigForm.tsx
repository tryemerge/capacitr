"use client";

import { useState, useEffect } from "react";

interface AgentConfigFormProps {
  projectId: string;
}

export function AgentConfigForm({ projectId }: AgentConfigFormProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [autoApproveThreshold, setAutoApproveThreshold] = useState("0.8");
  const [autoRejectThreshold, setAutoRejectThreshold] = useState("0.2");
  const [snapPollDuration, setSnapPollDuration] = useState("5");
  const [maxTokenAsk, setMaxTokenAsk] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/agent-configs/${projectId}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setSystemPrompt(data.systemPrompt ?? "");
        setAutoApproveThreshold(String(data.autoApproveThreshold ?? 0.8));
        setAutoRejectThreshold(String(data.autoRejectThreshold ?? 0.2));
        setSnapPollDuration(String(data.snapPollDurationMinutes ?? 5));
        setMaxTokenAsk(data.maxTokenAsk ? String(data.maxTokenAsk) : "");
      })
      .catch(() => {});
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/agent-configs/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          autoApproveThreshold: parseFloat(autoApproveThreshold),
          autoRejectThreshold: parseFloat(autoRejectThreshold),
          snapPollDurationMinutes: parseInt(snapPollDuration, 10),
          maxTokenAsk: maxTokenAsk ? parseFloat(maxTokenAsk) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* System Prompt */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">
          Agent System Prompt
        </label>
        <p className="text-[10px] text-zinc-500 mb-1">
          The orchestration agent uses this to evaluate work submissions.
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={8}
          placeholder="You are the work reviewer for this project..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none font-mono"
        />
      </div>

      {/* Thresholds */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Auto-Approve Threshold
          </label>
          <p className="text-[10px] text-zinc-500 mb-1">
            Confidence above this → auto-approve (0.0-1.0)
          </p>
          <input
            type="text"
            inputMode="decimal"
            value={autoApproveThreshold}
            onChange={(e) => setAutoApproveThreshold(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Auto-Reject Threshold
          </label>
          <p className="text-[10px] text-zinc-500 mb-1">
            Confidence below this → auto-reject (0.0-1.0)
          </p>
          <input
            type="text"
            inputMode="decimal"
            value={autoRejectThreshold}
            onChange={(e) => setAutoRejectThreshold(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Snap Poll + Max Ask */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Snap Poll Duration (min)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={snapPollDuration}
            onChange={(e) => setSnapPollDuration(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Max Token Ask
          </label>
          <p className="text-[10px] text-zinc-500 mb-1">
            Leave empty for unlimited
          </p>
          <input
            type="text"
            inputMode="decimal"
            value={maxTokenAsk}
            onChange={(e) => setMaxTokenAsk(e.target.value)}
            placeholder="1000"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {saved && <p className="text-emerald-400 text-xs">Configuration saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Configuration"}
      </button>
    </form>
  );
}
