"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "./SideNav";
import { TestToolbar } from "./TestToolbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/login";

  return (
    <>
      {showNav && <SideNav />}
      <div className={showNav ? "flex-1 ml-48" : "flex-1 min-h-screen flex flex-col"}>{children}</div>
      {showNav && <TestToolbar />}
    </>
  );
}
