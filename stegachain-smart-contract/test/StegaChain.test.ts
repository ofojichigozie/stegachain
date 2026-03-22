import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const ZERO_HASH = "0x" + "00".repeat(32);
const SAMPLE_HASH =
  "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
const ANOTHER_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

async function deployStegaChain() {
  const [owner, alice, bob] = await hre.ethers.getSigners();
  const StegaChain = await hre.ethers.getContractFactory("StegaChain");
  const contract = await StegaChain.deploy();
  return { contract, owner, alice, bob };
}

describe("StegaChain", function () {
  describe("logHash", function () {
    it("registers a new hash and emits HashLogged", async function () {
      const { contract, alice } = await loadFixture(deployStegaChain);

      await expect(contract.connect(alice).logHash(SAMPLE_HASH))
        .to.emit(contract, "HashLogged")
        .withArgs(SAMPLE_HASH, alice.address, (ts: bigint) => ts > 0n);
    });

    it("stores the correct sender and a non-zero timestamp", async function () {
      const { contract, alice } = await loadFixture(deployStegaChain);

      await contract.connect(alice).logHash(SAMPLE_HASH);
      const record = await contract.records(SAMPLE_HASH);

      expect(record.sender).to.equal(alice.address);
      expect(record.timestamp).to.be.greaterThan(0n);
    });

    it("reverts on a zero hash", async function () {
      const { contract, alice } = await loadFixture(deployStegaChain);

      await expect(
        contract.connect(alice).logHash(ZERO_HASH)
      ).to.be.revertedWith("StegaChain: zero hash");
    });

    it("reverts if the same hash is registered twice", async function () {
      const { contract, alice, bob } = await loadFixture(deployStegaChain);

      await contract.connect(alice).logHash(SAMPLE_HASH);

      await expect(
        contract.connect(bob).logHash(SAMPLE_HASH)
      ).to.be.revertedWith("StegaChain: hash already registered");
    });

    it("allows different hashes to be registered independently", async function () {
      const { contract, alice, bob } = await loadFixture(deployStegaChain);

      await contract.connect(alice).logHash(SAMPLE_HASH);
      await expect(contract.connect(bob).logHash(ANOTHER_HASH)).to.not.be
        .reverted;
    });
  });

  describe("verify", function () {
    it("returns (false, zero, 0) for an unregistered hash", async function () {
      const { contract } = await loadFixture(deployStegaChain);

      const [found, sender, timestamp] = await contract.verify(SAMPLE_HASH);

      expect(found).to.equal(false);
      expect(sender).to.equal(hre.ethers.ZeroAddress);
      expect(timestamp).to.equal(0n);
    });

    it("returns (true, sender, timestamp) after logHash", async function () {
      const { contract, alice } = await loadFixture(deployStegaChain);

      await contract.connect(alice).logHash(SAMPLE_HASH);
      const [found, sender, timestamp] = await contract.verify(SAMPLE_HASH);

      expect(found).to.equal(true);
      expect(sender).to.equal(alice.address);
      expect(timestamp).to.be.greaterThan(0n);
    });

    it("does not mutate state (view function)", async function () {
      const { contract } = await loadFixture(deployStegaChain);

      // Calling verify should not consume gas beyond the base call cost
      // and should be callable without a signer
      const [found] = await contract.verify(SAMPLE_HASH);
      expect(found).to.equal(false);
    });
  });

  describe("records mapping", function () {
    it("is publicly readable and returns the stored record", async function () {
      const { contract, bob } = await loadFixture(deployStegaChain);

      await contract.connect(bob).logHash(ANOTHER_HASH);

      const record = await contract.records(ANOTHER_HASH);
      expect(record.sender).to.equal(bob.address);
      expect(record.timestamp).to.be.greaterThan(0n);
    });
  });
});
