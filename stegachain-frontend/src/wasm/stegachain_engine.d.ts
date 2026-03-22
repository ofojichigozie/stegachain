/* tslint:disable */
/* eslint-disable */

/**
 * Returns the maximum payload bytes that can be embedded in a
 * `width × height` image using 1-bit LSB steganography (RGB channels only).
 */
export function capacity_bytes(width: number, height: number): number;

/**
 * Decrypts a blob of the form `nonce (12 bytes) || ciphertext`.
 *
 * Returns the original plaintext on success.
 */
export function decrypt(key: Uint8Array, payload: Uint8Array): Uint8Array;

/**
 * Embeds `payload` into raw RGBA bytes using 1-bit LSB steganography.
 *
 * `rgba` must be a flat `width × height × 4` byte array (from a Canvas).
 * Returns modified RGBA bytes of the same length.
 */
export function embed(rgba: Uint8Array, width: number, height: number, payload: Uint8Array): Uint8Array;

/**
 * Encrypts `plaintext` with AES-256-GCM using a 32-byte `key`.
 *
 * Returns `nonce (12 bytes) || ciphertext` as a single `Uint8Array`.
 */
export function encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array;

/**
 * Extracts a payload previously embedded with [`embed`] from raw RGBA bytes.
 *
 * Blind extraction — the original cover image is not needed.
 */
export function extract(rgba: Uint8Array, width: number, height: number): Uint8Array;

/**
 * Returns the SHA-256 digest of `data` as 32 raw bytes (`Uint8Array`).
 *
 * Suitable for passing as `bytes32` to a Solidity smart contract.
 */
export function sha256_bytes(data: Uint8Array): Uint8Array;

/**
 * Returns the SHA-256 digest of `data` as a 64-character lowercase hex string.
 */
export function sha256_hex(data: Uint8Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly encrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly decrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly sha256_bytes: (a: number, b: number) => [number, number];
    readonly sha256_hex: (a: number, b: number) => [number, number];
    readonly capacity_bytes: (a: number, b: number) => number;
    readonly embed: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly extract: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
