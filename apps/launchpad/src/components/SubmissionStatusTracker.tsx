"use client";

const STEPS = [
  { key: "pending", label: "Submitted" },
  { key: "reviewing", label: "Reviewing" },
  { key: "approved", label: "Approved" },
] as const;

const TERMINAL_STATES: Record<string, { label: string; color: string }> = {
  approved: { label: "Approved", color: "text-emerald-400" },
  rejected: { label: "Rejected", color: "text-red-400" },
  snap_poll: { label: "Sent to Poll", color: "text-amber-400" },
};

interface SubmissionStatusTrackerProps {
  status: string;
  reviewNotes?: string | null;
}

export function SubmissionStatusTracker({
  status,
  reviewNotes,
}: SubmissionStatusTrackerProps) {
  const stepIndex = STEPS.findIndex((s) => s.key === status);
  const isTerminal = status in TERMINAL_STATES;

  return (
    <div>
      {/* Steps */}
      <div className="flex items-center gap-2 mb-3">
        {STEPS.map((step, i) => {
          const isActive = i <= stepIndex || isTerminal;
          return (
            <div key={step.key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-6 ${isActive ? "bg-indigo-500" : "bg-zinc-800"}`}
                />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-indigo-500" : "bg-zinc-800"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal state badge */}
      {isTerminal && (
        <div
          className={`text-xs font-medium ${TERMINAL_STATES[status].color}`}
        >
          Outcome: {TERMINAL_STATES[status].label}
        </div>
      )}

      {/* Review notes */}
      {reviewNotes && (
        <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-md p-3">
          <div className="text-[10px] text-zinc-500 mb-1">Review Notes</div>
          <p className="text-xs text-zinc-300">{reviewNotes}</p>
        </div>
      )}
    </div>
  );
}
