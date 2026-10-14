import { http, createConfig, injected } from "wagmi";
import { botchainMainnet, BOTCHAIN_RPC_URL } from "./network";

export const wagmiConfig = createConfig({
  chains: [botchainMainnet],
  connectors: [injected()],
  transports: {
    [botchainMainnet.id]: http(BOTCHAIN_RPC_URL),
  },
  ssr: true,
});
