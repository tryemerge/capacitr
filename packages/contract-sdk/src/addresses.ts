import type { Address } from "viem";

export const CHAIN_IDS = {
  arbitrumSepolia: 421614,
} as const;

export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export interface DeploymentAddresses {
  diamond: Address;
  coreFacets: {
    IdeaFacet: Address;
    BondingCurveFacet: Address;
    ContextFacet: Address;
    ModuleRegistryFacet: Address;
  };
  moduleFacets: {
    AgentFacet: Address;
    ReservePoolFacet: Address;
    JobBoardFacet: Address;
    WorkMarketplaceFacet: Address;
    SnapPollFacet: Address;
  };
}

const arbitrumSepolia: DeploymentAddresses = {
  diamond: "0x98033F10c00306a6a4D64Af84Fb6fAabCA420967",
  coreFacets: {
    IdeaFacet: "0xa6c000aE607C85A7C888F092eB5ACf551Db86005",
    BondingCurveFacet: "0x55252f0b292096df644A352BA3d17b46E9aa4C25",
    ContextFacet: "0x33E1DA6419A088bdd1cc08c017ef9eA08F6C16E5",
    ModuleRegistryFacet: "0x7167c79234425Eecc170bA6e04F46dD37C6C4417",
  },
  moduleFacets: {
    AgentFacet: "0x495b386c29146Bc43DF6d2505DC0887a0e64B569",
    ReservePoolFacet: "0x803f98ee6bA9B8BD8eB90094143e7D6D75A43837",
    JobBoardFacet: "0xc2D5598bbfe7ad2f81d076b82Efc42EE5A070018",
    WorkMarketplaceFacet: "0x2dfab6D30706E0A252F75b420738ABDD0888F675",
    SnapPollFacet: "0x27dcfB1E835fc3C34E433007DB06C1A05fb9Ea49",
  },
};

export const deployments: Record<SupportedChainId, DeploymentAddresses> = {
  [CHAIN_IDS.arbitrumSepolia]: arbitrumSepolia,
};

/**
 * Get the Diamond proxy address for a chain.
 * All facet calls go through this single address.
 */
export function getDiamondAddress(chainId: SupportedChainId = CHAIN_IDS.arbitrumSepolia): Address {
  return deployments[chainId].diamond;
}
