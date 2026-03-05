"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AgentConfigForm } from "@/components/AgentConfigForm";

interface Project {
  id: string;
  name: string;
  symbol: string;
}

export default function ConfigurePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => setProject(data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-red-400 text-sm">Project not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-indigo-400 text-xs hover:underline"
        >
          &larr; {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100 mt-2 mb-1">Configure</h1>
        <p className="text-zinc-400 text-sm">
          Agent and project settings for{" "}
          <span className="font-medium text-zinc-300">{project.name}</span> (${project.symbol}).
        </p>
      </div>
      <AgentConfigForm projectId={id} />
    </div>
  );
}
