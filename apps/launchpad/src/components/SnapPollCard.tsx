"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SnapPollCardProps {
  id: string;
  question: string;
  status: string;
  endAt: string;
  yesWeight: number;
  noWeight: number;
  outcome?: string | null;
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

export function SnapPollCard({
  id,
  question,
  status,
  endAt,
  yesWeight,
  noWeight,
  outcome,
}: SnapPollCardProps) {
  const [countdown, setCountdown] = useState(timeRemaining(endAt));

  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => {
      setCountdown(timeRemaining(endAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt, status]);

  const total = yesWeight + noWeight;
  const yesPct = total > 0 ? (yesWeight / total) * 100 : 50;
  const noPct = total > 0 ? (noWeight / total) * 100 : 50;

  return (
    <Link
      href={`/polls/${id}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-zinc-200 font-medium line-clamp-2">{question}</p>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 shrink-0 ${
            status === "active"
              ? "bg-amber-950 text-amber-400"
              : outcome === "approved"
                ? "bg-emerald-950 text-emerald-400"
                : "bg-red-950 text-red-400"
          }`}
        >
          {status === "active" ? countdown : outcome ?? "finalized"}
        </span>
      </div>

      {/* Vote tally bars */}
      <div className="space-y-1.5">
        <div>
          <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5">
            <span>Yes</span>
            <span>{yesWeight.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${yesPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5">
            <span>No</span>
            <span>{noWeight.toFixed(1)}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${noPct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
