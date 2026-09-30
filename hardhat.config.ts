import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const BOTCHAIN_RPC_URL = process.env.BOTCHAIN_RPC_URL || "https://rpc.bohr.life";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bohrTestnet: {
      url: BOTCHAIN_RPC_URL,
      chainId: 968,
      accounts: PRIVATE_KEY && PRIVATE_KEY.length >= 64 ? [PRIVATE_KEY] : [],
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
      bohrTestnet: "any-dummy-value",
    },
    customChains: [
      {
        network: "bohrTestnet",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
