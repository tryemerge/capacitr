"use client";

interface QuadraticVoteWeightProps {
  balance: number;
  tokenType: "wToken" | "projectToken";
}

export function QuadraticVoteWeight({
  balance,
  tokenType,
}: QuadraticVoteWeightProps) {
  const eligible =
    tokenType === "wToken" ? balance >= 1 : balance >= 200;
  const weight = Math.sqrt(balance);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400">Your Vote Weight</span>
        {eligible ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium">
            Eligible
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-medium">
            Not Eligible
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <div className="text-[10px] text-zinc-500">Balance</div>
          <div className="text-sm font-mono text-zinc-200">{balance.toFixed(2)}</div>
          <div className="text-[10px] text-zinc-600">
            {tokenType === "wToken" ? "wTokens" : "tokens"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">Weight (√balance)</div>
          <div className="text-sm font-mono text-zinc-200">{weight.toFixed(2)}</div>
          <div className="text-[10px] text-zinc-600">quadratic</div>
        </div>
      </div>
      {!eligible && (
        <p className="text-[10px] text-zinc-500 mt-2">
          {tokenType === "wToken"
            ? "You need at least 1 wToken to vote."
            : "You need at least 200 project tokens to vote."}
        </p>
      )}
    </div>
  );
}
