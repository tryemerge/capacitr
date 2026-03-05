"use client";

import { LockTimer } from "./LockTimer";

interface WTokenPosition {
  projectId: string;
  projectName: string;
  symbol: string;
  balance: number;
  unlockAt: string;
  estimatedValue: number;
}

interface WorkerDashboardProps {
  positions: WTokenPosition[];
  totalEarnings: number;
}

export function WorkerDashboard({
  positions,
  totalEarnings,
}: WorkerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-[10px] text-zinc-500 mb-1">Total wToken Earnings</div>
          <div className="text-lg font-mono font-bold text-zinc-100">
            {totalEarnings.toFixed(2)}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-[10px] text-zinc-500 mb-1">Active Positions</div>
          <div className="text-lg font-mono font-bold text-zinc-100">
            {positions.length}
          </div>
        </div>
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <div className="text-zinc-600 text-sm">
          No wToken positions yet. Submit work to earn tokens.
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map((pos) => (
            <div
              key={pos.projectId}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    {pos.projectName}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    w${pos.symbol}
                  </div>
                </div>
                <LockTimer unlockAt={pos.unlockAt} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-zinc-500">Balance</div>
                  <div className="text-sm font-mono text-zinc-200">
                    {pos.balance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Est. Value</div>
                  <div className="text-sm font-mono text-zinc-200">
                    {pos.estimatedValue.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
