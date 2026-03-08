"use client";

import { ReactNode } from "react";
import { PrivyAuthProvider } from "@capacitr/auth";
import { arbitrumSepolia } from "@privy-io/chains";

/**
 * Privy provider — dynamically imported (no SSR).
 */
export function PrivyWagmiProviders({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </PrivyAuthProvider>
  );
}
