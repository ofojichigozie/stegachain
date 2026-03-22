/**
 * useCrypto — AES-256-GCM encrypt / decrypt via the WASM engine.
 */

import { useState, useCallback } from "react";
import { loadEngine, deriveKey } from "@/lib/wasm";
import { notify } from "@/lib/notifications";

export interface EncryptResult {
  /** nonce (12 bytes) || ciphertext blob — ready for LSB embedding. */
  ciphertext: Uint8Array;
  /** Raw 32-byte AES key, passed straight into the stego step. */
  key: Uint8Array;
}

export function useCrypto() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const encrypt = useCallback(
    async (plaintext: string, passphrase: string): Promise<EncryptResult | null> => {
      setIsEncrypting(true);
      try {
        const engine = await loadEngine();
        const key = await deriveKey(passphrase);
        const plaintextBytes = new TextEncoder().encode(plaintext);
        const ciphertext = engine.encrypt(key, plaintextBytes);
        notify.success("Encrypted");
        return { ciphertext, key };
      } catch {
        notify.error("Encryption failed");
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    []
  );

  const decrypt = useCallback(
    async (ciphertextBlob: Uint8Array, passphrase: string): Promise<string | null> => {
      setIsDecrypting(true);
      try {
        const engine = await loadEngine();
        const key = await deriveKey(passphrase);
        const plaintextBytes = engine.decrypt(key, ciphertextBlob);
        const plaintext = new TextDecoder().decode(plaintextBytes);
        notify.success("Decrypted");
        return plaintext;
      } catch {
        notify.error("Decryption failed", "Wrong passphrase or corrupted payload");
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  return { encrypt, decrypt, isEncrypting, isDecrypting };
}
