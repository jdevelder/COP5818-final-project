const hre = require("hardhat");

async function main() {
  console.log("Testing swap creation...\n");

  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments-localhost.json", "utf8"));

  const swapsAddress = deploymentInfo.contracts.SwapsContract;
  const priceOracleAddress = deploymentInfo.contracts.PriceOracle;

  console.log("SwapsContract address:", swapsAddress);
  console.log("PriceOracle address:", priceOracleAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with account:", signer.address);

  const swapsContract = await hre.ethers.getContractAt("SwapsContract", swapsAddress);
  const priceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracleAddress);

  // Check prices first
  console.log("\nChecking prices:");
  try {
    const [priceA] = await priceOracle.getPrice("Charizard-BaseSet-Rare");
    console.log("  Charizard price:", hre.ethers.formatEther(priceA), "ETH");

    const [priceB] = await priceOracle.getPrice("Blastoise-BaseSet-Rare");
    console.log("  Blastoise price:", hre.ethers.formatEther(priceB), "ETH");
  } catch (error) {
    console.error("Error getting prices:", error.message);
    return;
  }

  // Try to propose a swap
  console.log("\nAttempting to propose swap:");
  console.log("  Card A: Charizard-BaseSet-Rare");
  console.log("  Card B: Blastoise-BaseSet-Rare");
  console.log("  Notional A: 100 ETH");
  console.log("  Notional B: 90 ETH");
  console.log("  Duration: 7 days");

  const notionalA = hre.ethers.parseEther("100");
  const notionalB = hre.ethers.parseEther("90");
  const duration = 7 * 24 * 60 * 60; // 7 days in seconds

  // Calculate required collateral (15%)
  const requiredCollateral = (notionalA * 15n) / 100n;
  console.log("  Required collateral:", hre.ethers.formatEther(requiredCollateral), "ETH");

  try {
    const tx = await swapsContract.proposeSwap(
      "Charizard-BaseSet-Rare",
      "Blastoise-BaseSet-Rare",
      notionalA,
      notionalB,
      duration,
      { value: requiredCollateral }
    );

    console.log("\n✅ Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    await tx.wait();
    console.log("✅ Swap proposed successfully!");

  } catch (error) {
    console.error("\n❌ Error proposing swap:");
    console.error("Message:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
