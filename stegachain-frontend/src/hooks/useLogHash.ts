/**
 * useLogHash — submit an image hash to the StegaChain contract via logHash().
 *
 * Uses the ethers.js Contract class directly with the injected wallet provider.
 */

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, STEGA_CHAIN_ABI } from "@/config/contract";
import { getSigner } from "@/lib/ethers";
import { notify } from "@/lib/notifications";

export function useLogHash() {
  const { chain } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const logHash = useCallback(
    async (imageHashHex: string): Promise<boolean> => {
      if (!chain) {
        notify.warning("Wallet not connected");
        return false;
      }

      const contractAddress = CONTRACT_ADDRESSES[chain.id];
      if (!contractAddress || contractAddress === ethers.ZeroAddress) {
        notify.warning("Contract not deployed on this network");
        return false;
      }

      setIsSubmitting(true);
      setIsConfirmed(false);
      notify.info("Submitting transaction…");

      try {
        const signer = await getSigner();
        const contract = new ethers.Contract(contractAddress, STEGA_CHAIN_ABI, signer);

        const tx = await contract.logHash(imageHashHex);
        setTxHash(tx.hash);

        await tx.wait(1);
        setIsConfirmed(true);
        notify.success("Hash registered on-chain");
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (msg.includes("already registered")) {
          notify.warning("Already registered", "This image hash is already on-chain");
        } else if (!msg.includes("user rejected") && !msg.includes("denied")) {
          notify.error("Transaction failed", err);
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [chain]
  );

  return { logHash, txHash, isSubmitting, isConfirmed };
}
