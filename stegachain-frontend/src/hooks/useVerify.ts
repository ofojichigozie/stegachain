/**
 * useVerify — query the StegaChain contract's verify() function.
 *
 * Uses the ethers.js Contract class directly with the injected wallet
 * provider (read-only — no signing required for view calls).
 */

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, STEGA_CHAIN_ABI } from "@/config/contract";
import { getBrowserProvider } from "@/lib/ethers";
import { notify } from "@/lib/notifications";

export type VerifyStatus = "idle" | "checking" | "verified" | "not_found";

export interface VerifyResult {
  found: boolean;
  sender: string;
  timestamp: Date | null;
}

export function useVerify() {
  const { chain } = useAccount();
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  const verify = useCallback(
    async (imageHashHex: string): Promise<VerifyResult | null> => {
      if (!chain) {
        notify.warning("Wallet not connected");
        return null;
      }

      const contractAddress = CONTRACT_ADDRESSES[chain.id];
      if (!contractAddress || contractAddress === ethers.ZeroAddress) {
        notify.warning("Contract not deployed on this network");
        return null;
      }

      setStatus("checking");
      setResult(null);
      notify.info("Querying blockchain…");

      try {
        const provider = getBrowserProvider();
        const contract = new ethers.Contract(contractAddress, STEGA_CHAIN_ABI, provider);

        const [found, sender, timestamp]: [boolean, string, bigint] =
          await contract.verify(imageHashHex);

        const ts = found ? new Date(Number(timestamp) * 1000) : null;
        const verifyResult: VerifyResult = { found, sender, timestamp: ts };
        setResult(verifyResult);

        if (found) {
          const shortSender = `${sender.slice(0, 6)}…${sender.slice(-4)}`;
          notify.success(
            "Image verified ✓",
            `Registered by ${shortSender} on ${ts!.toLocaleDateString()}`
          );
          setStatus("verified");
        } else {
          notify.error("Not found — TAMPERED or UNREGISTERED");
          setStatus("not_found");
        }

        return verifyResult;
      } catch (err) {
        notify.error("Verification failed", err);
        setStatus("not_found");
        return null;
      }
    },
    [chain]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { verify, status, result, reset };
}
