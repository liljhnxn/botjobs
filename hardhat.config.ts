import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BOTCHAIN_RPC_URL = process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: BOTCHAIN_RPC_URL,
      chainId: 677,
      accounts: PRIVATE_KEY && PRIVATE_KEY.length >= 64 ? [PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei minimum fee
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "any-dummy-value",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
