"use client";

import { useState } from "react";

interface WorkSubmissionFormProps {
  projectId: string;
  onSubmitted?: () => void;
}

export function WorkSubmissionForm({ projectId, onSubmitted }: WorkSubmissionFormProps) {
  const [proofContent, setProofContent] = useState("");
  const [tokenAsk, setTokenAsk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/work-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          proofContent,
          tokenAsk: parseFloat(tokenAsk),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-950/50 border border-emerald-900 rounded-lg p-4 text-center">
        <div className="text-emerald-400 text-sm font-medium mb-1">Submitted</div>
        <p className="text-zinc-400 text-xs">
          Your work is now pending review by the orchestration agent.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Proof */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">
          Proof of Work
        </label>
        <p className="text-[10px] text-zinc-500 mb-1">
          Describe what you did. Link to commits, PRs, designs, or any evidence.
        </p>
        <textarea
          required
          value={proofContent}
          onChange={(e) => setProofContent(e.target.value)}
          rows={6}
          placeholder="I implemented the bonding curve chart component. See PR #42..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
        />
      </div>

      {/* Token Ask */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">
          Token Ask
        </label>
        <p className="text-[10px] text-zinc-500 mb-1">
          How many wTokens are you requesting for this contribution?
        </p>
        <input
          type="text"
          inputMode="decimal"
          required
          value={tokenAsk}
          onChange={(e) => setTokenAsk(e.target.value)}
          placeholder="100"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Work"}
      </button>
    </form>
  );
}
