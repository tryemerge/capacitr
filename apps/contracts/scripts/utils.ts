import { tasks } from "hardhat";
import { BaseContract, BytesLike } from "ethers";

const EXCLUDED_SELECTORS = ["owner", "transferOwnership"];

export function getSelectors(
  contract: BaseContract,
  excluded: string[] = EXCLUDED_SELECTORS
): BytesLike[] {
  const selectors = contract.interface.fragments
    .filter((fragment): fragment is import("ethers").FunctionFragment =>
      fragment.type === "function"
    )
    .filter((fragment) => !excluded.includes(fragment.name))
    .map((fragment) => contract.interface.getFunction(fragment.name)!.selector);

  return selectors;
}

export enum FacetCutAction {
  Add = 0,
  Replace = 1,
  Remove = 2,
}

export async function verifyContract(
  address: string,
  constructorArguments: unknown[] = []
): Promise<void> {
  try {
    const verifyTask = tasks.getTask("verify");
    await verifyTask.run({
      address,
      constructorArgs: constructorArguments.map(String),
    });
  } catch (e: any) {
    console.error(`  Verification failed for ${address}:`, e.message ?? e);
  }
}
