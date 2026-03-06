"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QuadraticVoteWeight } from "@/components/QuadraticVoteWeight";

interface Poll {
  id: string;
  projectId: string;
  submissionId: string;
  question: string;
  status: string;
  startAt: string;
  endAt: string;
  yesWeight: number;
  noWeight: number;
  outcome: string | null;
  votes: Array<{
    id: string;
    voterAddress: string;
    vote: string;
    weight: number;
  }>;
}

function timeRemaining(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export default function PollPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch(`/api/snap-polls/${pollId}`)
      .then((r) => r.json())
      .then((data) => {
        setPoll(data);
        setCountdown(timeRemaining(data.endAt));
      })
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, [pollId]);

  useEffect(() => {
    if (!poll || poll.status !== "active") return;
    const interval = setInterval(() => {
      setCountdown(timeRemaining(poll.endAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  async function castVote(vote: "yes" | "no") {
    if (!poll) return;
    setVoting(true);

    try {
      // Mock balance for now — in production, read from wallet
      const mockBalance = 100;

      await fetch(`/api/snap-polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vote,
          voterAddress: "0x0000000000000000000000000000000000000000",
          balance: mockBalance,
        }),
      });

      // Refresh poll data
      const res = await fetch(`/api/snap-polls/${pollId}`);
      const data = await res.json();
      setPoll(data);
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-zinc-600 text-sm">Loading poll...</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">Poll not found</div>
        <Link href="/" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const total = poll.yesWeight + poll.noWeight;
  const yesPct = total > 0 ? (poll.yesWeight / total) * 100 : 50;
  const noPct = total > 0 ? (poll.noWeight / total) * 100 : 50;
  const isActive = poll.status === "active" && new Date() < new Date(poll.endAt);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={`/projects/${poll.projectId}`}
        className="text-indigo-400 text-xs hover:underline"
      >
        &larr; Back to project
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100 font-heading mt-4 mb-2">Snap Poll</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <p className="text-zinc-200 font-medium">{poll.question}</p>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 shrink-0 ${
              isActive
                ? "bg-amber-950 text-amber-400"
                : poll.outcome === "approved"
                  ? "bg-emerald-950 text-emerald-400"
                  : "bg-red-950 text-red-400"
            }`}
          >
            {isActive ? countdown : poll.outcome ?? "finalized"}
          </span>
        </div>

        {/* Vote tally */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Yes</span>
              <span>
                {poll.yesWeight.toFixed(1)} ({yesPct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${yesPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>No</span>
              <span>
                {poll.noWeight.toFixed(1)} ({noPct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${noPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vote buttons */}
        {isActive && (
          <div className="flex gap-3">
            <button
              onClick={() => castVote("yes")}
              disabled={voting}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {voting ? "..." : "Vote Yes"}
            </button>
            <button
              onClick={() => castVote("no")}
              disabled={voting}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {voting ? "..." : "Vote No"}
            </button>
          </div>
        )}
      </div>

      {/* Vote weight info */}
      <QuadraticVoteWeight balance={100} tokenType="projectToken" />

      {/* Votes list */}
      {poll.votes && poll.votes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Votes ({poll.votes.length})
          </h2>
          <div className="space-y-1">
            {poll.votes.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50"
              >
                <span className="text-zinc-500 font-mono">
                  {v.voterAddress.slice(0, 6)}...{v.voterAddress.slice(-4)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">weight: {v.weight.toFixed(2)}</span>
                  <span
                    className={
                      v.vote === "yes" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {v.vote}
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
