/**
 * Chain and wallet configuration.
 *
 * Wagmi is used only for wallet connection state (account, connect, disconnect,
 * switchChain). All contract interactions use ethers.js directly.
 */

import { http, createConfig } from "wagmi";
import { bscTestnet, hardhat } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [bscTestnet, hardhat],
  connectors: [metaMask(), injected()],
  transports: {
    [bscTestnet.id]: http("https://bsc-testnet-dataseed.bnbchain.org:8545/"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

export { bscTestnet, hardhat };

/** The network the app targets — set VITE_NETWORK=hardhat for local dev. */
export const TARGET_CHAIN =
  import.meta.env.VITE_NETWORK === "hardhat" ? hardhat : bscTestnet;
