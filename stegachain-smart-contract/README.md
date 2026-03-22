# stegachain-smart-contract

Hardhat project containing the `StegaChain` Solidity contract — a minimal on-chain hash registry that lets senders prove provenance of a stego-image without revealing its content.

---

## Contract Overview — `StegaChain.sol`

```
StegaChain
├── mapping(bytes32 → Record) records   // public
├── event  HashLogged(imageHash, sender, timestamp)
├── function logHash(bytes32 imageHash) external
└── function verify(bytes32 imageHash) external view
         → (bool found, address sender, uint256 timestamp)
```

### `logHash(bytes32 imageHash)`

Registers the SHA-256 digest of a stego-image. Reverts if:
- `imageHash` is `bytes32(0)`
- The hash has already been registered (duplicate-prevention / replay guard)

Emits `HashLogged(imageHash, sender, block.timestamp)`.

### `verify(bytes32 imageHash) view`

Returns `(found, sender, timestamp)` for any hash. Safe to call without a signer.

### Security properties

- No admin key, no `selfdestruct`, no proxy — intentionally immutable.
- Each hash can only be registered once.
- `records` is `public`, so provenance data is openly auditable.

---

## Prerequisites

- Node.js ≥ 20
- npm

---

## Environment Variables

Create a `.env` file (never committed) before deploying to a live network:

```bash
# .env
DEPLOYER_PRIVATE_KEY=0x...          # wallet that will pay deployment gas
BSC_TESTNET_RPC_URL=https://...     # BSC Testnet JSON-RPC endpoint
BSCSCAN_API_KEY=...                 # for contract verification on BscScan
```

A `.env.example` template is provided for reference.

---

## Getting Started

```bash
npm install
```

### Compile

```bash
npm run compile        # runs: hardhat compile
```

Generated `artifacts/` and `typechain-types/` are git-ignored.

### Test

```bash
npm test               # runs: hardhat test
```

The test suite covers:

| Scenario | Expected result |
|----------|----------------|
| `logHash` with a valid new hash | emits `HashLogged`, stores sender + timestamp |
| `logHash` with zero hash | reverts with `"StegaChain: zero hash"` |
| `logHash` duplicate | reverts with `"StegaChain: hash already registered"` |
| `verify` unregistered hash | returns `(false, 0x0, 0)` |
| `verify` registered hash | returns `(true, sender, timestamp)` |
| `records` mapping | publicly readable, returns stored record |

### Local development node

```bash
npm run node           # starts Hardhat's in-process node on port 8545
```

```bash
# In a separate terminal
npm run deploy:local   # deploys to http://127.0.0.1:8545
```

After deployment, copy the printed address into the frontend's `src/config/contract.ts` under chain ID `31337`.

### Deploy to BSC Testnet

```bash
npm run deploy:bsctestnet
```

Copy the printed address into `src/config/contract.ts` under chain ID `97`.

### Verify on BscScan

```bash
npx hardhat verify --network bsctestnet <DEPLOYED_ADDRESS>
```

---

## Networks

| Network | Chain ID | npm script |
|---------|----------|-----------|
| Hardhat local | 31337 | `deploy:local` |
| BSC Testnet | 97 | `deploy:bsctestnet` |

---

## Project Structure

```
stegachain-smart-contract/
├── contracts/
│   └── StegaChain.sol        # The hash-registry contract
├── scripts/
│   └── deploy.ts             # Deployment script
├── test/
│   └── StegaChain.test.ts    # Hardhat + Chai test suite
├── hardhat.config.ts         # Network, Solidity, and path config
├── package.json
└── tsconfig.json
```
