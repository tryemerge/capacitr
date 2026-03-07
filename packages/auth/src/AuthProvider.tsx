"use client";

import { ReactNode, createContext, useContext } from "react";
import { PrivyProvider as PrivyProviderBase, usePrivy } from "@privy-io/react-auth";
import type { AuthContextValue, PrivyAuthConfig } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function PrivyAuthBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const displayName =
    user?.email?.address ||
    (user?.wallet?.address
      ? user.wallet.address.slice(0, 6) + "..." + user.wallet.address.slice(-4)
      : null);

  const value: AuthContextValue = {
    ready,
    authenticated,
    user: user
      ? {
          id: user.id,
          email: user.email?.address || null,
          displayName,
        }
      : null,
    login,
    logout: async () => {
      await logout();
      window.location.href = "/login";
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function PrivyAuthProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: PrivyAuthConfig;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error("NEXT_PUBLIC_PRIVY_APP_ID is not configured");
    const errorValue: AuthContextValue = {
      ready: true,
      authenticated: false,
      user: null,
      login: () => console.error("Privy not configured"),
      logout: async () => {},
    };
    return (
      <AuthContext.Provider value={errorValue}>{children}</AuthContext.Provider>
    );
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        appearance: {
          theme: config?.theme ?? "dark",
          accentColor: config?.accentColor ?? "#676FFF",
          ...(config?.logo !== undefined && { logo: config.logo }),
          ...(config?.landingHeader && { landingHeader: config.landingHeader }),
          ...(config?.loginMessage && { loginMessage: config.loginMessage }),
        },
        loginMethods: config?.loginMethods,
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <PrivyAuthBridge>{children}</PrivyAuthBridge>
    </PrivyProviderBase>
  );
}
