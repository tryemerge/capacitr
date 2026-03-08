"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/lib/auth-context";
import { IdeasProvider } from "@/lib/ideas-context";
import { QueryProvider } from "@/lib/query-client";

const PrivyWagmiProviders = dynamic(
  () => import("./privy-wagmi-providers").then((m) => m.PrivyWagmiProviders),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <PrivyWagmiProviders>
        <AuthProvider>
          <IdeasProvider>{children}</IdeasProvider>
        </AuthProvider>
      </PrivyWagmiProviders>
    </QueryProvider>
  );
}
