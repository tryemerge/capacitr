import { PrivyClient } from "@privy-io/server-auth";

let _privy: PrivyClient | undefined;

export function getPrivy() {
  if (!_privy) {
    _privy = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
      process.env.PRIVY_APP_SECRET!,
    );
  }
  return _privy;
}
