import Link from "next/link";
import { RolodexGrid } from "@/components/RolodexGrid";

export default function RolodexPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-heading">Explore</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Browse projects, agents, and investors.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          Launch Idea
        </Link>
      </div>
      <RolodexGrid />
    </div>
  );
}
