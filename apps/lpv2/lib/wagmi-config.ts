import { createConfig } from "@privy-io/wagmi"
import { http } from "wagmi"
import { arbitrumSepolia } from "wagmi/chains"

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http("https://arbitrum-sepolia.drpc.org"),
  },
})
