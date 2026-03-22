# stegachain-engine

Rust library that provides the cryptographic and steganographic core for StegaChain. It compiles to a native binary for unit testing and to **WebAssembly** for in-browser use via `wasm-pack`.

---

## Modules

| Module   | Responsibility |
|----------|---------------|
| `crypto` | AES-256-GCM encrypt / decrypt with a random 96-bit nonce per call |
| `hash`   | SHA-256 digest — raw `[u8; 32]` and lowercase hex string |
| `stego`  | 1-bit LSB steganography — embed payload into PNG RGBA data; blind extract |

All three modules expose plain `Result<T, String>` so they can be unit-tested natively without a WASM runtime. `JsValue` conversions are confined to `lib.rs`.

---

## Steganography Protocol

- Only R, G, B channels are modified — alpha is never touched.
- The first 32 bits embedded form a big-endian `u32` length header.
- Payload bytes follow immediately after the header, MSB first within each byte.
- Each bit replaces only the LSB of its channel, so pixel values shift by at most ±1 — visually imperceptible.

Maximum payload capacity for a `W × H` image:

```
capacity_bytes = floor((W × H × 3 − 32) / 8)
```

> **PNG only** — the embed/extract functions require lossless PNG input. Lossy formats (e.g. JPEG) would destroy the embedded payload.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Rust (stable toolchain) | ≥ 1.78 |
| `wasm32-unknown-unknown` target | — |
| `wasm-pack` | ≥ 0.12 |

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

---

## Building

### Native (for testing)

```bash
cargo test
```

### WebAssembly

```bash
wasm-pack build --target web
```

Output is written to `pkg/`. Copy the artifacts to the frontend:

```bash
cp pkg/stegachain_engine.js \
   pkg/stegachain_engine.d.ts \
   pkg/stegachain_engine_bg.wasm \
   pkg/stegachain_engine_bg.wasm.d.ts \
   ../stegachain-frontend/src/wasm/
```

---

## Running Tests

```bash
cargo test
```

All three modules have inline test suites covering:

- **crypto** — round-trip, unique nonce per call, wrong-key rejection, bad key-length errors
- **hash** — known-hash vectors, length assertions, determinism
- **stego** — round-trip, capacity boundary, header-only extraction, payload corruption detection

---

## WASM API Surface

Exposed via `#[wasm_bindgen]` in `lib.rs`:

| Function | Signature | Description |
|----------|-----------|-------------|
| `encrypt` | `(key: &[u8], plaintext: &[u8]) → Vec<u8>` | Returns `nonce ‖ ciphertext` |
| `decrypt` | `(key: &[u8], payload: &[u8]) → Vec<u8>` | Accepts `nonce ‖ ciphertext` |
| `sha256_bytes` | `(data: &[u8]) → Vec<u8>` | 32-byte raw digest |
| `sha256_hex` | `(data: &[u8]) → String` | 64-char hex digest |
| `capacity_bytes` | `(width: u32, height: u32) → u32` | Max embeddable bytes |
| `embed` | `(rgba: &[u8], width: u32, height: u32, payload: &[u8]) → Vec<u8>` | Returns modified RGBA |
| `extract` | `(rgba: &[u8], width: u32, height: u32) → Vec<u8>` | Blind extraction |

---

## Dependencies

| Crate | Purpose |
|-------|---------|
| `wasm-bindgen` | JS ↔ WASM bindings |
| `aes-gcm` | AES-256-GCM (RustCrypto) |
| `sha2` | SHA-256 (RustCrypto) |
| `getrandom` (js feature) | OS entropy source in WASM context |
