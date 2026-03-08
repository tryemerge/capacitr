// Addresses & chain config
export {
  CHAIN_IDS,
  deployments,
  getDiamondAddress,
  type SupportedChainId,
  type DeploymentAddresses,
} from "./addresses";

// Viem public client
export { publicClient } from "./client";

// ABIs
export * from "./abis";

// Services
export { idea, bondingCurve, context } from "./services";
