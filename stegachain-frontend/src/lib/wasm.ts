/**
 * WASM engine loader.
 *
 * Imports the JS glue from the local `src/wasm/` folder (artifacts copied
 * from `stegachain-engine/pkg/` after each Rust build — see wasm/README.md).
 *
 * `loadEngine()` initialises the WASM module on first call and caches the
 * result. Every subsequent call is a no-op and returns the cached handle.
 */

import initEngine, {
  encrypt,
  decrypt,
  embed,
  extract,
  sha256_bytes,
  sha256_hex,
  capacity_bytes,
} from "@/wasm/stegachain_engine.js";

export interface WasmEngine {
  encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array;
  decrypt(key: Uint8Array, payload: Uint8Array): Uint8Array;
  embed(rgba: Uint8Array, width: number, height: number, payload: Uint8Array): Uint8Array;
  /** Blind extraction — original cover image not needed. */
  extract(rgba: Uint8Array, width: number, height: number): Uint8Array;
  /** Returns 32-byte SHA-256 digest. */
  sha256Bytes(data: Uint8Array): Uint8Array;
  /** Returns 64-char lowercase hex SHA-256 digest. */
  sha256Hex(data: Uint8Array): string;
  /** Max bytes embeddable in a width×height image (RGB LSB). */
  capacityBytes(width: number, height: number): number;
}

let engine: WasmEngine | null = null;

export async function loadEngine(): Promise<WasmEngine> {
  if (engine) return engine;

  // Initialise the WASM binary. The default export resolves the .wasm URL
  // automatically via import.meta.url — Vite handles this at build time.
  await initEngine();

  engine = {
    encrypt,
    decrypt,
    embed,
    extract,
    sha256Bytes: sha256_bytes,
    sha256Hex: sha256_hex,
    capacityBytes: capacity_bytes,
  };

  return engine;
}

export async function decodeImageToRgba(
  file: File
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return {
    data: new Uint8Array(imageData.data.buffer),
    width: bitmap.width,
    height: bitmap.height,
  };
}

export async function encodeRgbaToPng(
  rgba: Uint8Array,
  width: number,
  height: number
): Promise<Blob> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

/**
 * Derive a 32-byte AES-256 key from a UTF-8 passphrase using SHA-256.
 * This is suitable for a prototype. A real system would use HKDF or PBKDF2.
 */
export async function deriveKey(passphrase: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(passphrase);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return new Uint8Array(digest);
}
