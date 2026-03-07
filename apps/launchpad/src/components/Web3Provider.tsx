"use client";

import dynamic from "next/dynamic";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

const PrivyAuthProvider = dynamic(
  () => import("@capacitr/auth").then((m) => m.PrivyAuthProvider),
  { ssr: false },
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider config={{ loginMethods: ["email", "wallet", "google", "twitter", "github"] }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyAuthProvider>
  );
}
