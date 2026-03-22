/**
 * useStego — LSB steganographic embedding and extraction via the WASM engine.
 *
 * Image decode/encode is handled in JS via OffscreenCanvas (WASM cannot
 * access the DOM).
 */

import { useState, useCallback } from "react";
import { loadEngine, decodeImageToRgba, encodeRgbaToPng } from "@/lib/wasm";
import { notify } from "@/lib/notifications";

export interface EmbedResult {
  /** Stego-image as a downloadable PNG Blob. */
  blob: Blob;
  /** Raw PNG bytes — used immediately for hashing without a second read. */
  pngBytes: Uint8Array;
  width: number;
  height: number;
}

export function useStego() {
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const embed = useCallback(
    async (coverImage: File, data: Uint8Array): Promise<EmbedResult | null> => {
      setIsEmbedding(true);
      try {
        const engine = await loadEngine();
        const { data: rgba, width, height } = await decodeImageToRgba(coverImage);
        const stegoRgba = engine.embed(rgba, width, height, data);
        const blob = await encodeRgbaToPng(stegoRgba, width, height);
        const pngBytes = new Uint8Array(await blob.arrayBuffer());
        notify.success("Stego-image created");
        return { blob, pngBytes, width, height };
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (msg.includes("capacity") || msg.includes("too large")) {
          notify.error("Payload too large", "Choose a bigger cover image");
        } else {
          notify.error("Embedding failed");
        }
        return null;
      } finally {
        setIsEmbedding(false);
      }
    },
    []
  );

  const extract = useCallback(async (stegoImage: File): Promise<Uint8Array | null> => {
    setIsExtracting(true);
    try {
      const engine = await loadEngine();
      const { data: rgba, width, height } = await decodeImageToRgba(stegoImage);
      const payload = engine.extract(rgba, width, height);
      notify.success("Payload extracted");
      return payload;
    } catch (err) {
      notify.error("Extraction failed", "Is this a valid stego-image?");
      console.error("[useStego] extract failed:", err);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return { embed, extract, isEmbedding, isExtracting };
}
