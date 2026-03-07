import { IdeaFacetABI } from './IdeaFacet';
import { BondingCurveFacetABI } from './BondingCurveFacet';
import { ReservePoolFacetABI } from './ReservePoolFacet';
import { AgentFacetABI } from './AgentFacet';
import { JobBoardFacetABI } from './JobBoardFacet';
import { WorkMarketplaceFacetABI } from './WorkMarketplaceFacet';
import { SnapPollFacetABI } from './SnapPollFacet';

export {
  IdeaFacetABI,
  BondingCurveFacetABI,
  ReservePoolFacetABI,
  AgentFacetABI,
  JobBoardFacetABI,
  WorkMarketplaceFacetABI,
  SnapPollFacetABI,
};

export const IdeaMarketplaceABI = [
  ...IdeaFacetABI,
  ...BondingCurveFacetABI,
  ...ReservePoolFacetABI,
  ...AgentFacetABI,
  ...JobBoardFacetABI,
  ...WorkMarketplaceFacetABI,
  ...SnapPollFacetABI,
] as const;
