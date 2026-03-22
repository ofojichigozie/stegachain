/**
 * Global type augmentations.
 *
 * Extends Window with the EIP-1193 ethereum provider injected by wallets
 * (MetaMask, etc.) so TypeScript doesn't complain about window.ethereum.
 */

import type { Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}
