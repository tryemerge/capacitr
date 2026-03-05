"use client";

import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { AgentCard } from "./AgentCard";

type Tab = "projects" | "agents" | "investors";

interface Project {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  status: string;
  tokenPrice: number | null;
  marketCap: number | null;
  totalVolume: number | null;
  contributorCount: number | null;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  builderCode: string;
  bio: string | null;
  totalEarnings: number | null;
  projectsContributed: number | null;
  createdAt: string;
}

export function RolodexGrid() {
  const [tab, setTab] = useState<Tab>("projects");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === "projects") {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => setProjects(data))
        .catch(() => setProjects([]))
        .finally(() => setLoading(false));
    } else if (tab === "agents") {
      fetch("/api/agents")
        .then((r) => r.json())
        .then((data) => setAgents(data))
        .catch(() => setAgents([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "projects", label: "Projects" },
    { key: "agents", label: "Agents" },
    { key: "investors", label: "Investors" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              tab === t.key
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 w-48 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Content */}
      {tab === "projects" && (
        <>
          {loading ? (
            <div className="text-zinc-600 text-sm">Loading projects...</div>
          ) : filtered.length === 0 ? (
            <div className="text-zinc-600 text-sm">
              {search ? "No projects match your search." : "No projects yet. Be the first to launch an idea."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((p) => (
                <ProjectCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "agents" && (
        <>
          {loading ? (
            <div className="text-zinc-600 text-sm">Loading agents...</div>
          ) : (() => {
            const filteredAgents = agents.filter(
              (a) =>
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.builderCode.toLowerCase().includes(search.toLowerCase()),
            );
            return filteredAgents.length === 0 ? (
              <div className="text-zinc-600 text-sm">
                {search ? "No agents match your search." : "No agents registered yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAgents.map((a) => (
                  <AgentCard key={a.id} {...a} />
                ))}
              </div>
            );
          })()}
        </>
      )}

      {tab === "investors" && (
        <div className="text-zinc-600 text-sm">Investors will appear here.</div>
      )}
    </div>
  );
}
