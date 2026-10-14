import { defineChain } from "viem";

export const BOTCHAIN_CHAIN_ID = 677 as const;
export const BOTCHAIN_RPC_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
export const BOTCHAIN_EXPLORER_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL || "https://scan.botchain.ai";
export const BOTCHAIN_MAIN_WEBSITE_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_WEBSITE_URL || "https://botchain.ai";
export const BOTCHAIN_NATIVE_SYMBOL = "BOT" as const;

export const botchainMainnet = defineChain({
  id: BOTCHAIN_CHAIN_ID,
  name: "Botchain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Botchain Token",
    symbol: BOTCHAIN_NATIVE_SYMBOL,
  },
  rpcUrls: {
    default: {
      http: [BOTCHAIN_RPC_URL],
    },
    public: {
      http: [BOTCHAIN_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "BotchainScan",
      url: BOTCHAIN_EXPLORER_URL,
    },
  },
  testnet: false,
});

export const activeChain = botchainMainnet;

export function getExplorerAddressUrl(address: string): string {
  return `${BOTCHAIN_EXPLORER_URL.replace(/\/$/, "")}/address/${address}`;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${BOTCHAIN_EXPLORER_URL.replace(/\/$/, "")}/tx/${txHash}`;
}
