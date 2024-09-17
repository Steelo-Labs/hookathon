const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Bazaar Hooks with the account:", deployer.address);

  const LibBazaarHooks = await ethers.getContractFactory("LibBazaarHooks");
  const libBazaarHooks = await LibBazaarHooks.deploy();
  await libBazaarHooks.deployed();

  console.log("LibBazaarHooks deployed to:", libBazaarHooks.address);

  const hookAddress = await libBazaarHooks.getHookAddress(deployer.address);
  const flags = await libBazaarHooks.calculateHookFlags();
  const salt = await libBazaarHooks.calculateHookSalt();

  console.log("Calculated Hook Address:", hookAddress);
  console.log("Hook Flags:", flags);
  console.log("Hook Salt:", salt);

  const BazaarHookFacet = await ethers.getContractFactory("BazaarHookFacet");
  const bazaarHookFacet = await BazaarHookFacet.deploy();
  await bazaarHookFacet.deployed();

  console.log("BazaarHookFacet deployed to:", bazaarHookFacet.address);

  // Verify that the deployed address matches the calculated address
  if (bazaarHookFacet.address.toLowerCase() !== hookAddress.toLowerCase()) {
    console.error("Deployed address does not match calculated address!");
  } else {
    console.log("Hook deployment successful and address verified.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });