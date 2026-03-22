import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying StegaChain with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  const StegaChain = await hre.ethers.getContractFactory("StegaChain");
  const contract = await StegaChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("StegaChain deployed to:", address);
  console.log("Network:", hre.network.name);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nVerify on Etherscan with:");
    console.log(
      `  npx hardhat verify --network ${hre.network.name} ${address}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
