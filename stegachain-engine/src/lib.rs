//! # stegachain-engine
//!
//! Core cryptography and steganography library for StegaChain.
//! Compiles to native (for testing) and to WebAssembly (for the browser frontend).
//!
//! ## Modules
//! | Module | Responsibility |
//! |--------|---------------|
//! | `crypto` | AES-256-GCM encrypt / decrypt |
//! | `hash`   | SHA-256 (raw bytes and hex string) |
//! | `stego`  | LSB image steganography embed / extract |
//!
//! ## Design note
//! Core modules (`crypto`, `hash`, `stego`) use plain `Result<T, String>` so
//! they can be unit-tested natively without a WASM runtime.
//! `JsValue` conversions are confined to this file.

mod crypto;
mod hash;
mod stego;

use wasm_bindgen::prelude::*;

// -----------------------------------------------------------------------------
// Crypto — AES-256-GCM
// -----------------------------------------------------------------------------

/// Encrypts `plaintext` with AES-256-GCM using a 32-byte `key`.
///
/// Returns `nonce (12 bytes) || ciphertext` as a single `Uint8Array`.
#[wasm_bindgen]
pub fn encrypt(key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, JsValue> {
    crypto::encrypt(key, plaintext).map_err(|e| JsValue::from_str(&e))
}

/// Decrypts a blob of the form `nonce (12 bytes) || ciphertext`.
///
/// Returns the original plaintext on success.
#[wasm_bindgen]
pub fn decrypt(key: &[u8], payload: &[u8]) -> Result<Vec<u8>, JsValue> {
    crypto::decrypt(key, payload).map_err(|e| JsValue::from_str(&e))
}

// -----------------------------------------------------------------------------
// Hash — SHA-256
// -----------------------------------------------------------------------------

/// Returns the SHA-256 digest of `data` as 32 raw bytes (`Uint8Array`).
///
/// Suitable for passing as `bytes32` to a Solidity smart contract.
#[wasm_bindgen]
pub fn sha256_bytes(data: &[u8]) -> Vec<u8> {
    hash::sha256_bytes(data)
}

/// Returns the SHA-256 digest of `data` as a 64-character lowercase hex string.
#[wasm_bindgen]
pub fn sha256_hex(data: &[u8]) -> String {
    hash::sha256_hex(data)
}

// -----------------------------------------------------------------------------
// Stego — LSB image steganography
// -----------------------------------------------------------------------------

/// Returns the maximum payload bytes that can be embedded in a
/// `width × height` image using 1-bit LSB steganography (RGB channels only).
#[wasm_bindgen]
pub fn capacity_bytes(width: u32, height: u32) -> u32 {
    stego::capacity_bytes(width, height)
}

/// Embeds `payload` into raw RGBA bytes using 1-bit LSB steganography.
///
/// `rgba` must be a flat `width × height × 4` byte array (from a Canvas).
/// Returns modified RGBA bytes of the same length.
#[wasm_bindgen]
pub fn embed(rgba: &[u8], width: u32, height: u32, payload: &[u8]) -> Result<Vec<u8>, JsValue> {
    stego::embed(rgba, width, height, payload).map_err(|e| JsValue::from_str(&e))
}

/// Extracts a payload previously embedded with [`embed`] from raw RGBA bytes.
///
/// Blind extraction — the original cover image is not needed.
#[wasm_bindgen]
pub fn extract(rgba: &[u8], width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    stego::extract(rgba, width, height).map_err(|e| JsValue::from_str(&e))
}
