"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { SideNav } from "./SideNav";

const PrivyAuthProvider = dynamic(
  () => import("@capacitr/auth").then((m) => m.PrivyAuthProvider),
  { ssr: false },
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/login";

  return (
    <PrivyAuthProvider config={{ theme: "light", accentColor: "#4f46e5" }}>
      {showNav && <SideNav />}
      <div className={showNav ? "flex-1 ml-48" : "flex-1"}>{children}</div>
    </PrivyAuthProvider>
  );
}
