const hre = require("hardhat");

async function main() {
  console.log("Setting prices for all cards...\n");

  // Get the deployed PriceOracle address
  const fs = require("fs");

  // Try localhost first, then hardhat
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("./deployments-localhost.json", "utf8"));
  } catch (e) {
    deploymentInfo = JSON.parse(fs.readFileSync("./deployments-hardhat.json", "utf8"));
  }

  const priceOracleAddress = deploymentInfo.contracts.PriceOracle;
  console.log("PriceOracle address:", priceOracleAddress);

  // Get the contract
  const priceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracleAddress);

  // Set prices for all cards
  const cardPrices = [
    { id: "Charizard-BaseSet-Rare", price: "10", confidence: 95 },
    { id: "BlackLotus-Alpha-Mythic", price: "100000", confidence: 98 },
    { id: "PikachuEX-XY-Rare", price: "5", confidence: 90 },
    { id: "TimeWalk-Alpha-Rare", price: "15000", confidence: 97 },
    { id: "Blastoise-BaseSet-Rare", price: "9", confidence: 92 },
    { id: "Venusaur-BaseSet-Rare", price: "7", confidence: 91 }
  ];

  console.log("\nSetting prices:");
  for (const card of cardPrices) {
    try {
      console.log(`Setting ${card.id}: ${card.price} ETH (confidence: ${card.confidence}%)`);
      const tx = await priceOracle.updatePrice(
        card.id,
        hre.ethers.parseEther(card.price),
        card.confidence
      );
      await tx.wait();
      console.log(`  ✅ ${card.id} set successfully`);
    } catch (error) {
      console.error(`  ❌ Failed to set ${card.id}:`, error.message);
      throw error; // Stop if any price fails
    }
  }

  console.log("\n✅ All prices set successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
