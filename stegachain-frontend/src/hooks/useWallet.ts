/**
 * useWallet — wallet connection, account info, and network state.
 *
 * Wraps wagmi primitives so UI components never import wagmi directly.
 * Contract interactions are handled separately via ethers.js hooks.
 */

import { useCallback, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { TARGET_CHAIN } from "@/config/chains";
import { notify } from "@/lib/notifications";

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const isCorrectNetwork = chain?.id === TARGET_CHAIN.id;

  useEffect(() => {
    if (isConnected && chain && chain.id !== TARGET_CHAIN.id) {
      notify.error("Wrong network", `Please use ${TARGET_CHAIN.name}. Disconnecting…`);
      disconnectAsync().catch(() => {});
    }
  }, [isConnected, chain, disconnectAsync]);

  const connect = useCallback(async () => {
    try {
      const connector = connectors.find((c) => c.name === "MetaMask") ?? connectors[0];
      if (!connector) throw new Error("No wallet connector available");
      await connectAsync({ connector });
      notify.success("Wallet connected");
    } catch (err) {
      if (isUserRejection(err)) return;
      notify.error("Connection failed");
    }
  }, [connectors, connectAsync]);

  const disconnect = useCallback(async () => {
    await disconnectAsync();
    notify.info("Wallet disconnected");
  }, [disconnectAsync]);

  return {
    address,
    isConnected,
    chain,
    isCorrectNetwork,
    targetChain: TARGET_CHAIN,
    connect,
    disconnect,
  };
}

function isUserRejection(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    msg.includes("user rejected") ||
    msg.includes("user denied") ||
    msg.includes("rejected")
  );
}
