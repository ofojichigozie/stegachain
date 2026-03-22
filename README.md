# StegaChain

StegaChain is a privacy-preserving, blockchain-anchored steganography system. A sender encrypts a secret message with AES-256-GCM, hides the ciphertext inside a cover image using LSB steganography, and registers the SHA-256 hash of the resulting stego-image on an EVM-compatible blockchain. A receiver can independently verify integrity and authenticity without trusting any central server.

All cryptography and steganography runs entirely in the browser via **WebAssembly** — no plaintext ever leaves the client.

---

## Repository Structure

```
stegachain/
├── stegachain-engine/        # Rust library — compiles to WebAssembly
├── stegachain-frontend/      # React + TypeScript web application
└── stegachain-smart-contract/# Solidity contract + Hardhat toolchain
```

---

## Packages

### `stegachain-engine` — Rust / WebAssembly Core

The cryptographic and steganographic engine. Implements:

| Module  | Function |
|---------|----------|
| `crypto` | AES-256-GCM encrypt / decrypt (random nonce per call) |
| `hash`   | SHA-256 — raw bytes and hex string |
| `stego`  | 1-bit LSB embed / extract over RGB channels with a 32-bit length header |

Compiled to WASM with `wasm-pack` and consumed by the frontend. See [`stegachain-engine/README.md`](stegachain-engine/README.md).

### `stegachain-frontend` — React Web Application

A single-page React application (Vite + TypeScript + Tailwind CSS) with two main flows:

- **Sender** — encrypt → embed → hash → log on-chain
- **Receiver** — extract → decrypt → verify on-chain

Wallet connection is handled by **Wagmi**; contract interaction by **ethers.js**. See [`stegachain-frontend/README.md`](stegachain-frontend/README.md).

### `stegachain-smart-contract` — Solidity / Hardhat

A minimal hash-registry contract (`StegaChain.sol`) deployed on an EVM network. It stores `(sender, timestamp)` keyed by `bytes32` image hash with duplicate-prevention and a `verify()` view function. See [`stegachain-smart-contract/README.md`](stegachain-smart-contract/README.md).

---

## End-to-End Flow

```
Sender side
───────────
1. User enters a secret message + passphrase
2. Browser derives 32-byte key: SHA-256(passphrase)
3. WASM: AES-256-GCM encrypt(key, message) → ciphertext blob
4. User drops a cover image (PNG)
5. WASM: LSB embed(rgba, ciphertext) → stego-image RGBA
6. Browser encodes RGBA → PNG and offers download
7. WASM: SHA-256(png_bytes) → imageHash
8. Frontend: contract.logHash(imageHash) via MetaMask

Receiver side
─────────────
1. User drops the stego-image
2. WASM: LSB extract(rgba) → ciphertext blob  ┐ both triggered
   WASM: SHA-256(file_bytes) → imageHash       ┘ by one button
3. User enters passphrase; WASM: AES-256-GCM decrypt → plaintext
4. Frontend: contract.verify(imageHash) → found / sender / timestamp
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Rust + Cargo | stable | Engine build |
| wasm-pack | ≥ 0.12 | WASM compilation |
| Node.js | ≥ 20 | Frontend & contract tooling |
| pnpm / npm | any | Package management |
| MetaMask | any | Browser wallet |

---

## Quick Start

```bash
# 1. Build the WASM engine
cd stegachain-engine
wasm-pack build --target web
cp pkg/stegachain_engine{.js,.d.ts,_bg.wasm,_bg.wasm.d.ts} \
       ../stegachain-frontend/src/wasm/

# 2. Start the frontend (dev server)
cd ../stegachain-frontend
npm install
npm run dev

# 3. Start a local Hardhat node (separate terminal)
cd ../stegachain-smart-contract
npm install
npm run node

# 4. Deploy contract to local node (separate terminal)
npm run deploy:local
# → note the deployed address and update src/config/contract.ts : 31337
```

---

## Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Hardhat local | 31337 | Development |
| BSC Testnet | 97 | Testing — deploy and update address in `contract.ts` |

---

## Security Notes

- Private keys and RPC secrets are loaded exclusively from `.env` files (never committed — see `.gitignore`).
- Key derivation in the current prototype uses `SHA-256(passphrase)`. A production deployment should use PBKDF2 or HKDF with a random salt.
- The smart contract has no admin key, no `selfdestruct`, and no upgradability — it is intentionally immutable.
