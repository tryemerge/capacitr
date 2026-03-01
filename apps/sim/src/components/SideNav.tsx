"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Simulator",
    description: "Configure & run",
    icon: "⚡",
  },
  {
    href: "/walkthrough",
    label: "Walkthrough",
    description: "Step-by-step",
    icon: "📖",
  },
  {
    href: "/amm",
    label: "AMM Sandbox",
    description: "Two-AMM pricing",
    icon: "🔄",
  },
  {
    href: "/runs",
    label: "Sim Runs",
    description: "Configure & analyze",
    icon: "📊",
  },
  {
    href: "/deliberate",
    label: "Facilitator",
    description: "Live deliberation",
    icon: "🧠",
  },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-48 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="text-sm font-bold text-gray-900">Capacitor</div>
        <div className="text-[10px] text-gray-400">Deliberation Sim</div>
      </div>

      {/* Links */}
      <div className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base leading-none mt-0.5">{item.icon}</span>
              <div>
                <div className={`font-medium ${active ? "text-indigo-700" : ""}`}>
                  {item.label}
                </div>
                <div className={`text-[10px] ${active ? "text-indigo-500" : "text-gray-400"}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="text-[10px] text-gray-300">capacitr.io</div>
      </div>
    </nav>
  );
}
