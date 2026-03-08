import { createPublicClient, http, type PublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://arbitrum-sepolia.drpc.org"),
});
