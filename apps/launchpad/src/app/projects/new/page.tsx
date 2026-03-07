"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LaunchIdeaPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [decayK, setDecayK] = useState("0.002");
  const [graduationThreshold, setGraduationThreshold] = useState("69000");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          description: description || undefined,
          systemPrompt,
          decayK: parseFloat(decayK),
          graduationThreshold: parseFloat(graduationThreshold),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 font-heading mb-1">Launch Idea</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Create a new project with its own token and bonding curve.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Project Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Cool Project"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Token Symbol
          </label>
          <input
            type="text"
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="MCP"
            maxLength={8}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What does this project do?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            System Prompt
          </label>
          <p className="text-[10px] text-zinc-500 mb-1">
            Instructions for the orchestration agent that reviews work submissions.
          </p>
          <textarea
            required
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            placeholder="You are the work reviewer for this project. Approve contributions that..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none font-mono"
          />
        </div>

        {/* Bonding curve params */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Decay K
            </label>
            <p className="text-[10px] text-zinc-500 mb-1">
              Controls bonding curve steepness
            </p>
            <input
              type="text"
              inputMode="decimal"
              required
              value={decayK}
              onChange={(e) => setDecayK(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Graduation Threshold
            </label>
            <p className="text-[10px] text-zinc-500 mb-1">
              Market cap to trigger graduation
            </p>
            <input
              type="text"
              inputMode="decimal"
              required
              value={graduationThreshold}
              onChange={(e) => setGraduationThreshold(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Launching..." : "Launch Project"}
        </button>
      </form>
    </div>
  );
}
