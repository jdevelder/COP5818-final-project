const hre = require("hardhat");

async function main() {
  console.log("Checking all prices...\n");

  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments-localhost.json", "utf8"));

  const priceOracleAddress = deploymentInfo.contracts.PriceOracle;
  const priceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracleAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("Checking with account:", signer.address);
  console.log("PriceOracle address:", priceOracleAddress);

  const cards = [
    "Charizard-BaseSet-Rare",
    "BlackLotus-Alpha-Mythic",
    "PikachuEX-XY-Rare",
    "TimeWalk-Alpha-Rare",
    "Blastoise-BaseSet-Rare",
    "Venusaur-BaseSet-Rare"
  ];

  console.log("\nCard prices:");
  for (const cardId of cards) {
    try {
      // Get price data directly from storage
      const priceData = await priceOracle.prices(cardId);
      console.log(`\n${cardId}:`);
      console.log(`  Price: ${hre.ethers.formatEther(priceData.price)} ETH`);
      console.log(`  Timestamp: ${priceData.timestamp.toString()}`);
      console.log(`  Confidence: ${priceData.confidence}%`);
      console.log(`  isActive: ${priceData.isActive}`);
    } catch (error) {
      console.log(`\n${cardId}: ERROR -`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
