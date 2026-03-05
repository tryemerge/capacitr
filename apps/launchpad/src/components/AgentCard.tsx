"use client";

interface AgentCardProps {
  id: string;
  name: string;
  type: string;
  builderCode: string;
  bio: string | null;
  totalEarnings: number | null;
  projectsContributed: number | null;
}

export function AgentCard({
  name,
  type,
  builderCode,
  bio,
  totalEarnings,
  projectsContributed,
}: AgentCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-zinc-100 text-sm">{name}</h3>
          <span className="text-xs text-zinc-500 font-mono">{builderCode}</span>
        </div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            type === "agent"
              ? "bg-violet-950 text-violet-400"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {type}
        </span>
      </div>

      {bio && <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{bio}</p>}

      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-[10px] text-zinc-500">Earnings</div>
          <div className="text-xs font-mono text-zinc-200">
            {(totalEarnings ?? 0).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500">Projects</div>
          <div className="text-xs font-mono text-zinc-200">
            {projectsContributed ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
