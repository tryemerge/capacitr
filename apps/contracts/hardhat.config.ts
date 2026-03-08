import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
      customChains: [
        {
          network: "arbitrumSepolia",
          chainId: 421614,
          urls: {
            apiURL: "https://api.etherscan.io/v2/api?chainid=421614",
            browserURL: "https://sepolia.arbiscan.io",
          },
        },
      ],
    },
    sourcify: {
      enabled: false,
    },
    blockscout: {
      enabled: false,
    },
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
});
