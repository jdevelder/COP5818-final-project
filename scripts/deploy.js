const hre = require("hardhat");

async function main() {
  console.log("Deploying TCG Derivatives Trading Platform...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // Deploy TCGCardToken
  console.log("Deploying TCGCardToken...");
  const TCGCardToken = await hre.ethers.getContractFactory("TCGCardToken");
  const tcgCardToken = await TCGCardToken.deploy();
  await tcgCardToken.waitForDeployment();
  const tcgCardTokenAddress = await tcgCardToken.getAddress();
  console.log("TCGCardToken deployed to:", tcgCardTokenAddress);
  console.log();

  // Deploy PriceOracle
  console.log("Deploying PriceOracle...");
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("PriceOracle deployed to:", priceOracleAddress);
  console.log();

  // Deploy FuturesContract
  console.log("Deploying FuturesContract...");
  const FuturesContract = await hre.ethers.getContractFactory("FuturesContract");
  const futuresContract = await FuturesContract.deploy(priceOracleAddress);
  await futuresContract.waitForDeployment();
  const futuresContractAddress = await futuresContract.getAddress();
  console.log("FuturesContract deployed to:", futuresContractAddress);
  console.log();

  // Deploy OptionsContract
  console.log("Deploying OptionsContract...");
  const OptionsContract = await hre.ethers.getContractFactory("OptionsContract");
  const optionsContract = await OptionsContract.deploy(
    priceOracleAddress,
    deployer.address // Fee collector
  );
  await optionsContract.waitForDeployment();
  const optionsContractAddress = await optionsContract.getAddress();
  console.log("OptionsContract deployed to:", optionsContractAddress);
  console.log();

  // Deploy SwapsContract
  console.log("Deploying SwapsContract...");
  const SwapsContract = await hre.ethers.getContractFactory("SwapsContract");
  const swapsContract = await SwapsContract.deploy(priceOracleAddress);
  await swapsContract.waitForDeployment();
  const swapsContractAddress = await swapsContract.getAddress();
  console.log("SwapsContract deployed to:", swapsContractAddress);
  console.log();

  // Summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("TCGCardToken:     ", tcgCardTokenAddress);
  console.log("PriceOracle:      ", priceOracleAddress);
  console.log("FuturesContract:  ", futuresContractAddress);
  console.log("OptionsContract:  ", optionsContractAddress);
  console.log("SwapsContract:    ", swapsContractAddress);
  console.log("=".repeat(60));
  console.log();

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TCGCardToken: tcgCardTokenAddress,
      PriceOracle: priceOracleAddress,
      FuturesContract: futuresContractAddress,
      OptionsContract: optionsContractAddress,
      SwapsContract: swapsContractAddress
    }
  };

  fs.writeFileSync(
    `./deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to deployments-${hre.network.name}.json`);

  // Initialize some sample data for testing (only on local networks)
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("\nInitializing sample data for testing...");

    // Mint some test cards
    console.log("Minting test cards...");
    await tcgCardToken.mintCard(
      deployer.address,
      "Charizard",
      "Base Set",
      5,
      10,
      "ipfs://charizard"
    );
    await tcgCardToken.mintCard(
      deployer.address,
      "Black Lotus",
      "Alpha",
      5,
      9,
      "ipfs://blacklotus"
    );
    console.log("Test cards minted!");

    // Set some initial prices
    console.log("Setting initial prices...");
    await priceOracle.updatePrice("Charizard-BaseSet-Rare", hre.ethers.parseEther("10"), 95);
    await priceOracle.updatePrice("BlackLotus-Alpha-Mythic", hre.ethers.parseEther("100000"), 98);
    await priceOracle.updatePrice("PikachuEX-XY-Rare", hre.ethers.parseEther("5"), 90);
    console.log("Initial prices set!");
  }

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
