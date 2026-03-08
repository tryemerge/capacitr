"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { arbitrumSepolia } from "@privy-io/chains";
import { AuthProvider } from "@/lib/auth-context";
import { IdeasProvider } from "@/lib/ideas-context";
import { QueryProvider } from "@/lib/query-client";

const PrivyAuthProvider = dynamic(
  () => import("@capacitr/auth").then((m) => m.PrivyAuthProvider),
  { ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <PrivyAuthProvider
        config={{
          loginMethods: ["email", "wallet", "twitter", "farcaster"],
          theme: "light",
          accentColor: "#F97316",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/C%20logo-CGFdgDnMtYmhvbg6hX416emVkdAZYn.png",
        landingHeader: "From Prompt to Enterprise",
        loginMessage: "Log in or sign up to launch ideas",
        defaultChain: arbitrumSepolia,
        supportedChains: [arbitrumSepolia],
      }}
    >
      <AuthProvider>
        <IdeasProvider>{children}</IdeasProvider>
      </AuthProvider>
    </PrivyAuthProvider>
    </QueryProvider>
  );
}
