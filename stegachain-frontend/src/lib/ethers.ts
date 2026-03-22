/**
 * Ethers.js browser provider helpers.
 *
 * Centralises access to the injected wallet provider (window.ethereum)
 * so hooks never reference window.ethereum directly.
 */

import { ethers } from "ethers";

export function getBrowserProvider(): ethers.BrowserProvider {
  if (!window.ethereum) {
    throw new Error(
      "No Ethereum wallet detected. Please install MetaMask or another wallet."
    );
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = getBrowserProvider();
  return provider.getSigner();
}
