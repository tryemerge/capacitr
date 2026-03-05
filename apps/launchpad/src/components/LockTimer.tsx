"use client";

import { useState, useEffect } from "react";

interface LockTimerProps {
  unlockAt: string; // ISO date string
}

function timeRemaining(unlockAt: string): {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const diff = new Date(unlockAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
}

export function LockTimer({ unlockAt }: LockTimerProps) {
  const [time, setTime] = useState(timeRemaining(unlockAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timeRemaining(unlockAt));
    }, 60_000); // Update every minute
    return () => clearInterval(interval);
  }, [unlockAt]);

  if (time.expired) {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium">
        Unlocked
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-medium">
        Locked
      </span>
      <div className="flex gap-1 font-mono text-[10px] text-zinc-400">
        <span>{time.days}d</span>
        <span>{time.hours}h</span>
        <span>{time.minutes}m</span>
      </div>
    </div>
  );
}
