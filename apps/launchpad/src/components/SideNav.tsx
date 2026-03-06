"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, AccountSettingsModal } from "@capacitr/auth";

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Launchpad",
    items: [
      { href: "/", label: "Explore", description: "Browse projects", icon: "🧭" },
      { href: "/projects/new", label: "Launch Idea", description: "Create a project", icon: "🚀" },
      { href: "/register", label: "Register", description: "Get builder code", icon: "🪪" },
      { href: "/investors", label: "Investors", description: "Test portfolios", icon: "💼" },
      { href: "/dashboard", label: "Dashboard", description: "Your earnings", icon: "📊" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/brand-kit", label: "Brand Kit", description: "Colors & style guide", icon: "🎨" },
    ],
  },
];

export function SideNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-48 bg-zinc-100 border-r border-zinc-200 flex flex-col z-20">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-zinc-200">
        <div className="text-sm font-bold text-zinc-900 font-heading uppercase tracking-wider">Capacitr</div>
        <div className="text-[10px] text-brand-orange font-medium">Hack-a-thon</div>
      </div>

      {/* Sections */}
      <div className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
                    }`}
                  >
                    <span className="text-base leading-none mt-0.5">{item.icon}</span>
                    <div>
                      <div className={`font-medium ${active ? "text-white" : ""}`}>
                        {item.label}
                      </div>
                      <div className={`text-[10px] ${active ? "text-indigo-100" : "text-zinc-400"}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-200 space-y-2">
        <Link
          href="/login"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-brand-orange hover:bg-zinc-200 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">🔑</span>
          Login
        </Link>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-zinc-400">capacitr.io</div>
          <AccountSettingsModal />
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
