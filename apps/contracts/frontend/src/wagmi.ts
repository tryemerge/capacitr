import { http, createConfig } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http('https://arbitrum-sepolia-testnet.api.pocket.network'),
  },
});

// Diamond proxy address — update after deployment
export const DIAMOND_ADDRESS = '0xc57fD8464eaC5D7bd93923F9764C98C9862a5a9e' as const;
