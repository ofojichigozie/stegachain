# stegachain-frontend

React + TypeScript single-page application for StegaChain. Provides a browser-based **Sender** flow (encrypt → embed → register on-chain) and **Receiver** flow (verify → extract → decrypt), with all cryptography and steganography running locally via WebAssembly.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + React Router v6 |
| Build tool | Vite + `vite-plugin-wasm` + `vite-plugin-top-level-await` |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Wallet connection | Wagmi v2 |
| Contract interaction | ethers.js v6 |
| Crypto / stego engine | WASM (stegachain-engine) |
| Notifications | Sonner |

---

## Prerequisites

- Node.js ≥ 20
- npm (or pnpm/yarn)
- WASM artifacts built from `stegachain-engine` — see [Updating WASM](#updating-wasm) below
- MetaMask (or any injected EVM wallet) for on-chain operations

---

## Environment Variables

Create a `.env` file (never committed) if you need to override defaults:

```bash
# Optional — defaults to bsctestnet
VITE_NETWORK=hardhat   # set this for local Hardhat development
```

A `.env.example` template:

```bash
VITE_NETWORK=bsctestnet
```

---

## Getting Started

```bash
npm install
npm run dev        # starts Vite dev server at http://localhost:5173
```

> **Note:** `vite.config.ts` sets `Cross-Origin-Embedder-Policy: require-corp` and
> `Cross-Origin-Opener-Policy: same-origin` on the dev server. These headers are
> required for browsers to execute WASM modules. Your production host must set them too.

### Build for production

```bash
npm run build      # TypeScript check + Vite bundle → dist/
npm run preview    # preview the production bundle locally
```

### Lint / format

```bash
npm run lint
npm run format        # Prettier (auto-fix)
npm run format:check  # Prettier (CI check)
```

---

## Project Structure

```
src/
├── App.tsx                  # Root component — routing + providers
├── components/              # Reusable UI components
│   ├── FileDropzone.tsx
│   ├── HashDisplay.tsx
│   ├── Layout.tsx
│   ├── ReceiverFlow.tsx     # Step-by-step receiver UI
│   ├── SenderFlow.tsx       # Step-by-step sender UI
│   ├── Spinner.tsx
│   ├── StepCard.tsx
│   └── WalletButton.tsx
├── config/
│   ├── chains.ts            # Wagmi config + target chain selection
│   └── contract.ts          # ABI + deployed contract addresses
├── hooks/
│   ├── useCrypto.ts         # AES-256-GCM via WASM
│   ├── useHash.ts           # SHA-256 via WASM
│   ├── useLogHash.ts        # contract.logHash() transaction
│   ├── useStego.ts          # LSB embed / extract via WASM
│   ├── useVerify.ts         # contract.verify() query
│   └── useWallet.ts         # Wallet connect / disconnect helpers
├── lib/
│   ├── ethers.ts            # BrowserProvider + signer helpers
│   ├── notifications.ts     # Centralised Sonner toast wrappers
│   └── wasm.ts              # WASM engine loader + image codec helpers
├── pages/
│   ├── HomePage.tsx
│   ├── SenderPage.tsx
│   └── ReceiverPage.tsx
└── wasm/                    # Compiled WASM artifacts (see below)
    ├── stegachain_engine.js
    ├── stegachain_engine.d.ts
    ├── stegachain_engine_bg.wasm
    └── stegachain_engine_bg.wasm.d.ts
```

---

## Updating WASM

When the Rust engine changes, rebuild and copy artifacts:

```bash
# From the repository root
cd stegachain-engine
wasm-pack build --target web
cp pkg/stegachain_engine.js \
   pkg/stegachain_engine.d.ts \
   pkg/stegachain_engine_bg.wasm \
   pkg/stegachain_engine_bg.wasm.d.ts \
   ../stegachain-frontend/src/wasm/
```

The `.wasm` binary is committed to source control so the frontend works without requiring a local Rust toolchain.

---

## Contract Address Configuration

After deploying `StegaChain.sol`, update the address in [`src/config/contract.ts`](src/config/contract.ts):

```ts
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  31337: "0x...",  // Hardhat local
  97:    "0x...",  // BSC Testnet
};
```

---

## Networks

| Network | Chain ID | `VITE_NETWORK` |
|---------|----------|----------------|
| BSC Testnet | 97 | `bsctestnet` (default) |
| Hardhat local | 31337 | `hardhat` |

---

## Security Notes

- All cryptography runs in-browser via WASM — no plaintext is sent to any server.
- Key derivation uses `SHA-256(passphrase)` (prototype-grade). A production build should replace `deriveKey()` in `lib/wasm.ts` with PBKDF2 or HKDF.
- `window.ethereum` access is centralised in `lib/ethers.ts` — no hook references it directly.
