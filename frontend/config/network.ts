import { defineChain } from "viem";

export const BOTCHAIN_CHAIN_ID = 968 as const;
export const BOTCHAIN_RPC_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.bohr.life";
export const BOTCHAIN_EXPLORER_URL =
  process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL || "https://scan.bohr.life";
export const BOTCHAIN_NATIVE_SYMBOL = "BOT" as const;

export const botchainTestnet = defineChain({
  id: BOTCHAIN_CHAIN_ID,
  name: "Botchain / Bohr Testnet",
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
      name: "BohrScan",
      url: BOTCHAIN_EXPLORER_URL,
    },
  },
  testnet: true,
});

export function getExplorerAddressUrl(address: string): string {
  return `${BOTCHAIN_EXPLORER_URL.replace(/\/$/, "")}/address/${address}`;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${BOTCHAIN_EXPLORER_URL.replace(/\/$/, "")}/tx/${txHash}`;
}
