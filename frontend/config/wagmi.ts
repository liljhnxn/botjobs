import { http, createConfig, injected } from "wagmi";
import { botchainTestnet, BOTCHAIN_RPC_URL } from "./network";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  connectors: [injected()],
  transports: {
    [botchainTestnet.id]: http(BOTCHAIN_RPC_URL),
  },
  ssr: true,
});
