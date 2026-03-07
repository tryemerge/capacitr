import { IdeaFacetABI } from './IdeaFacet';
import { BondingCurveFacetABI } from './BondingCurveFacet';
import { ReservePoolFacetABI } from './ReservePoolFacet';
import { AgentFacetABI } from './AgentFacet';
import { JobBoardFacetABI } from './JobBoardFacet';
import { WorkMarketplaceFacetABI } from './WorkMarketplaceFacet';
import { SnapPollFacetABI } from './SnapPollFacet';
import { ContextFacetABI } from './ContextFacet';
import { ModuleRegistryFacetABI } from './ModuleRegistryFacet';

export {
  IdeaFacetABI,
  BondingCurveFacetABI,
  ReservePoolFacetABI,
  AgentFacetABI,
  JobBoardFacetABI,
  WorkMarketplaceFacetABI,
  SnapPollFacetABI,
  ContextFacetABI,
  ModuleRegistryFacetABI,
};

export const IdeaMarketplaceABI = [
  ...IdeaFacetABI,
  ...BondingCurveFacetABI,
  ...ReservePoolFacetABI,
  ...AgentFacetABI,
  ...JobBoardFacetABI,
  ...WorkMarketplaceFacetABI,
  ...SnapPollFacetABI,
  ...ContextFacetABI,
  ...ModuleRegistryFacetABI,
] as const;
