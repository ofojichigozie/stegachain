/**
 * useHash — compute a SHA-256 digest of a File or raw bytes via the WASM engine.
 */

import { useState, useCallback } from "react";
import { loadEngine } from "@/lib/wasm";
import { notify } from "@/lib/notifications";

export interface HashResult {
  /** Raw 32-byte SHA-256 digest. */
  digest: Uint8Array;
  /** 0x-prefixed 64-char hex string — ready for Solidity bytes32. */
  hex: `0x${string}`;
}

export function useHash() {
  const [isHashing, setIsHashing] = useState(false);

  const hashFile = useCallback(async (file: File): Promise<HashResult | null> => {
    setIsHashing(true);
    try {
      const engine = await loadEngine();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const digest = engine.sha256Bytes(bytes);
      const hex = `0x${engine.sha256Hex(bytes)}` as `0x${string}`;
      return { digest, hex };
    } catch (err) {
      notify.error("Hashing failed", err);
      return null;
    } finally {
      setIsHashing(false);
    }
  }, []);

  /**
   * Hash raw bytes directly (used after embed when pngBytes are already in
   * memory — avoids a redundant file read).
   */
  const hashBytes = useCallback(async (bytes: Uint8Array): Promise<HashResult | null> => {
    setIsHashing(true);
    try {
      const engine = await loadEngine();
      const digest = engine.sha256Bytes(bytes);
      const hex = `0x${engine.sha256Hex(bytes)}` as `0x${string}`;
      return { digest, hex };
    } catch (err) {
      notify.error("Hashing failed", err);
      return null;
    } finally {
      setIsHashing(false);
    }
  }, []);

  return { hashFile, hashBytes, isHashing };
}
