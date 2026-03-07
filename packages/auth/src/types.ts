export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => Promise<void>;
}

export type PrivyLoginMethod =
  | "wallet"
  | "email"
  | "sms"
  | "google"
  | "twitter"
  | "discord"
  | "github"
  | "linkedin"
  | "apple"
  | "farcaster"
  | "telegram"
  | "passkey";

export interface PrivyAuthConfig {
  theme?: "dark" | "light";
  accentColor?: `#${string}`;
  loginMethods?: PrivyLoginMethod[];
  logo?: string;
  landingHeader?: string;
  loginMessage?: string;
  defaultChain?: import("@privy-io/chains").Chain;
  supportedChains?: import("@privy-io/chains").Chain[];
}
