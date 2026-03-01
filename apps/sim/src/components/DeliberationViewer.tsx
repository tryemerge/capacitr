"use client";

import { useState, useRef, useCallback } from "react";

// ---- Types matching PipelineEvent from @capacitr/facilitator ----

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

interface Claim {
  id: string;
  type: string;
  statement: string;
  reason?: string;
  evidence?: string;
  assumptions: string[];
  referencesClaimId?: string;
}

interface ResearchResult {
  claimId: string;
  query: string;
  findings: string;
  verdict: string;
  sources: string[];
}

interface Position {
  id: string;
  label: string;
  description: string;
  supportingClaims: string[];
  opposingClaims: string[];
  votes: number;
}

interface DecisionOption {
  id: string;
  label: string;
  description: string;
  pros: string[];
  cons: string[];
  unknowns: string[];
  supportingClaimIds: string[];
}

interface DeliberationState {
  topic: string;
  messages: Message[];
  claims: Claim[];
  researchResults: ResearchResult[];
  positions: Position[];
  openQuestions: string[];
  expertiseGaps: string[];
  summary: string;
  decisionMenu: DecisionOption[];
}

interface PipelineEvent {
  type: string;
  [key: string]: unknown;
}

interface LogEntry {
  id: number;
  timestamp: number;
  event: PipelineEvent;
}

// ---- Verdict colors ----

function verdictColor(verdict: string) {
  switch (verdict) {
    case "supported":
      return "text-green-400";
    case "contradicted":
      return "text-red-400";
    case "inconclusive":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

function claimTypeColor(type: string) {
  switch (type) {
    case "factual":
      return "bg-blue-500/20 text-blue-300";
    case "proposal":
      return "bg-purple-500/20 text-purple-300";
    case "rebuttal":
      return "bg-red-500/20 text-red-300";
    case "reframe":
      return "bg-amber-500/20 text-amber-300";
    case "supporting":
      return "bg-green-500/20 text-green-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
}

// ---- Stage indicator ----

type Stage = "idle" | "extracting" | "researching" | "synthesizing" | "done" | "error";

function StageIndicator({ stage }: { stage: Stage }) {
  const config: Record<Stage, { label: string; color: string; pulse: boolean }> = {
    idle: { label: "Waiting", color: "bg-gray-600", pulse: false },
    extracting: { label: "Extracting Claims", color: "bg-cyan-500", pulse: true },
    researching: { label: "Researching", color: "bg-amber-500", pulse: true },
    synthesizing: { label: "Synthesizing", color: "bg-purple-500", pulse: true },
    done: { label: "Complete", color: "bg-green-500", pulse: false },
    error: { label: "Error", color: "bg-red-500", pulse: false },
  };
  const c = config[stage];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${c.color} ${c.pulse ? "animate-pulse" : ""}`} />
      <span className="text-xs text-gray-400">{c.label}</span>
    </div>
  );
}

// ---- Main Component ----

export function DeliberationViewer() {
  const [topic, setTopic] = useState("Should we migrate our contracts to Arbitrum?");
  const [skipResearch, setSkipResearch] = useState(true);
  const [author, setAuthor] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [state, setState] = useState<DeliberationState | null>(null);
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  const addLog = useCallback((event: PipelineEvent) => {
    setLog((prev) => [
      ...prev,
      { id: logIdRef.current++, timestamp: Date.now(), event },
    ]);
    // auto-scroll
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!author.trim() || !messageText.trim() || sending) return;
    setSending(true);
    setStage("extracting");

    const body = {
      sessionId: sessionId.current,
      topic,
      author: author.trim(),
      content: messageText.trim(),
      skipResearch,
    };

    setMessageText("");

    try {
      const res = await fetch("/api/deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        setStage("error");
        addLog({ type: "error", stage: "network", error: `HTTP ${res.status}` });
        setSending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const event: PipelineEvent = JSON.parse(payload);
            addLog(event);

            // Update stage based on event
            switch (event.type) {
              case "extraction_start":
                setStage("extracting");
                break;
              case "research_start":
                setStage("researching");
                break;
              case "synthesis_start":
                setStage("synthesizing");
                break;
              case "state_updated":
                setState(event.state as DeliberationState);
                setStage("done");
                break;
              case "error":
                setStage("error");
                break;
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setStage("error");
      addLog({ type: "error", stage: "fetch", error: String(err) });
    } finally {
      setSending(false);
    }
  }, [author, messageText, sending, topic, skipResearch, addLog]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-white">Deliberation Viewer</h1>
          <StageIndicator stage={stage} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={skipResearch}
              onChange={(e) => setSkipResearch(e.target.checked)}
              className="rounded"
            />
            Skip Research
          </label>
        </div>
      </div>

      {/* Topic bar */}
      <div className="px-6 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Topic:</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none"
            placeholder="Enter deliberation topic..."
          />
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat + Input */}
        <div className="w-[360px] flex flex-col border-r border-gray-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {state?.messages.map((m) => (
              <div key={m.id} className="bg-gray-900 rounded-lg p-3">
                <div className="text-xs font-semibold text-indigo-400 mb-1">{m.author}</div>
                <div className="text-sm text-gray-300">{m.content}</div>
              </div>
            ))}
            {(!state || state.messages.length === 0) && (
              <div className="text-xs text-gray-600 text-center mt-8">
                Send a message to start the deliberation
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-3 space-y-2">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name..."
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                rows={2}
                className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !author.trim() || !messageText.trim()}
                className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded font-medium transition-colors"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Pipeline Activity + State */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Activity Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs min-h-0">
            {log.length === 0 && (
              <div className="text-gray-600 text-center mt-8">
                Pipeline events will appear here as messages are processed
              </div>
            )}
            {log.map((entry) => (
              <EventLine key={entry.id} event={entry.event} />
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Deliberation State */}
          {state && (
            <div className="border-t border-gray-800 overflow-y-auto max-h-[45%]">
              <StatePanel state={state} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Event rendering ----

function EventLine({ event }: { event: PipelineEvent }) {
  switch (event.type) {
    case "message_received": {
      const m = event.message as Message;
      return <div className="text-gray-400">→ <span className="text-indigo-400">{m.author}</span>: &quot;{m.content.slice(0, 60)}{m.content.length > 60 ? "..." : ""}&quot;</div>;
    }
    case "extraction_start":
      return <div className="text-cyan-500">⟳ Extracting claims...</div>;
    case "extraction_complete": {
      const r = event.result as { claims: Claim[]; isNovel: boolean };
      return <div className="text-cyan-400">✓ Extracted {r.claims.length} claim(s) — novel: {r.isNovel ? "yes" : "no"}</div>;
    }
    case "claim_added": {
      const c = event.claim as Claim;
      return (
        <div className="flex items-center gap-1.5 ml-3">
          <span className={`px-1 rounded text-[10px] ${claimTypeColor(c.type)}`}>{c.type}</span>
          <span className="text-gray-300">{c.statement}</span>
        </div>
      );
    }
    case "gaps_found":
      return <div className="text-amber-400 ml-3">⚠ Gaps: {(event.gaps as string[]).join(", ")}</div>;
    case "research_start":
      return <div className="text-amber-500">⟳ Researching {event.count as number} claim(s)...</div>;
    case "research_skipped":
      return <div className="text-gray-600">○ Research skipped</div>;
    case "research_claim_complete": {
      const r = event.result as ResearchResult;
      return (
        <div className="ml-3">
          <span className={verdictColor(r.verdict)}>● {r.verdict}</span>
          <span className="text-gray-500"> [{r.claimId}]</span>
          <span className="text-gray-400"> {r.findings.slice(0, 80)}</span>
        </div>
      );
    }
    case "synthesis_start":
      return <div className="text-purple-500">⟳ Synthesizing...</div>;
    case "synthesis_complete":
      return <div className="text-purple-400">✓ Synthesis complete</div>;
    case "state_updated":
      return <div className="text-green-500">✓ State updated</div>;
    case "error":
      return <div className="text-red-400">✗ Error in {event.stage as string}: {event.error as string}</div>;
    default:
      return <div className="text-gray-600">{JSON.stringify(event)}</div>;
  }
}

// ---- State panel ----

function StatePanel({ state }: { state: DeliberationState }) {
  return (
    <div className="p-4 space-y-4 text-xs">
      {/* Summary */}
      {state.summary && (
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Summary</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{state.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Positions */}
        {state.positions.length > 0 && (
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Positions</h3>
            <div className="space-y-2">
              {state.positions.map((p) => (
                <div key={p.id} className="bg-gray-900 rounded p-2">
                  <div className="font-semibold text-green-400">[{p.id}] {p.label}</div>
                  <div className="text-gray-400 mt-0.5">{p.description}</div>
                  {p.supportingClaims.length > 0 && (
                    <div className="text-green-600 mt-0.5">+ {p.supportingClaims.join(", ")}</div>
                  )}
                  {p.opposingClaims.length > 0 && (
                    <div className="text-red-600 mt-0.5">- {p.opposingClaims.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Claims */}
        {state.claims.length > 0 && (
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
              Claims ({state.claims.length})
            </h3>
            <div className="space-y-1">
              {state.claims.map((c) => (
                <div key={c.id} className="flex items-start gap-1.5">
                  <span className={`px-1 rounded text-[10px] shrink-0 mt-0.5 ${claimTypeColor(c.type)}`}>
                    {c.type}
                  </span>
                  <span className="text-gray-400">[{c.id}] {c.statement}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Open Questions */}
        {state.openQuestions.length > 0 && (
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Open Questions</h3>
            <ul className="space-y-0.5">
              {state.openQuestions.map((q, i) => (
                <li key={i} className="text-yellow-400">? {q}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Expertise Gaps */}
        {state.expertiseGaps.length > 0 && (
          <section>
            <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Expertise Gaps</h3>
            <ul className="space-y-0.5">
              {state.expertiseGaps.map((g, i) => (
                <li key={i} className="text-pink-400">! {g}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Decision Menu */}
      {state.decisionMenu.length > 0 && (
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Decision Menu</h3>
          <div className="space-y-2">
            {state.decisionMenu.map((d) => (
              <div key={d.id} className="bg-gray-900 rounded p-2">
                <div className="font-semibold text-blue-400">[{d.id}] {d.label}</div>
                <div className="text-gray-400 mt-0.5">{d.description}</div>
                {d.pros.length > 0 && <div className="text-green-500 mt-0.5">+ {d.pros.join("; ")}</div>}
                {d.cons.length > 0 && <div className="text-red-500 mt-0.5">- {d.cons.join("; ")}</div>}
                {d.unknowns.length > 0 && <div className="text-yellow-500 mt-0.5">? {d.unknowns.join("; ")}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Research Results */}
      {state.researchResults.length > 0 && (
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Research Results</h3>
          <div className="space-y-1">
            {state.researchResults.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`shrink-0 ${verdictColor(r.verdict)}`}>● {r.verdict}</span>
                <span className="text-gray-400">[{r.claimId}] {r.findings}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
