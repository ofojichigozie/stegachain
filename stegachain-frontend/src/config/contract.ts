import type { Address } from "viem";

export const CONTRACT_ADDRESSES: Record<number, Address> = {
  /** Hardhat local node */
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  /** BSC Testnet — fill in after deploy */
  97: "0x0000000000000000000000000000000000000000",
};

export const STEGA_CHAIN_ABI = [
  {
    type: "function",
    name: "logHash",
    stateMutability: "nonpayable",
    inputs: [{ name: "imageHash", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "verify",
    stateMutability: "view",
    inputs: [{ name: "imageHash", type: "bytes32" }],
    outputs: [
      { name: "found", type: "bool" },
      { name: "sender", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "records",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "sender", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "HashLogged",
    inputs: [
      { name: "imageHash", type: "bytes32", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
