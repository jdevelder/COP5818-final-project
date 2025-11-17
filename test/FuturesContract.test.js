const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("FuturesContract", function () {
  let futuresContract, priceOracle;
  let owner, trader1, trader2;

  const CARD_ID = "Charizard-BaseSet-Rare";
  const INITIAL_PRICE = ethers.parseEther("10");

  beforeEach(async function () {
    [owner, trader1, trader2] = await ethers.getSigners();

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Set initial price
    await priceOracle.updatePrice(CARD_ID, INITIAL_PRICE, 95);

    // Deploy FuturesContract
    const FuturesContract = await ethers.getContractFactory("FuturesContract");
    futuresContract = await FuturesContract.deploy(await priceOracle.getAddress());
    await futuresContract.waitForDeployment();
  });

  describe("Opening Positions", function () {
    it("Should open a long futures position", async function () {
      const strikePrice = ethers.parseEther("12");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60; // 7 days

      // Calculate required collateral (20% of strike * quantity)
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await expect(
        futuresContract.connect(trader1).openPosition(
          CARD_ID,
          0, // LONG
          strikePrice,
          quantity,
          duration,
          { value: requiredCollateral }
        )
      ).to.emit(futuresContract, "PositionOpened");

      const positions = await futuresContract.getTraderPositions(trader1.address);
      expect(positions.length).to.equal(1);
    });

    it("Should open a short futures position", async function () {
      const strikePrice = ethers.parseEther("8");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;

      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        1, // SHORT
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      const position = await futuresContract.getPosition(1);
      expect(position[2]).to.equal(1); // positionType should be SHORT
    });

    it("Should revert if insufficient collateral", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;

      const insufficientCollateral = ethers.parseEther("1");

      await expect(
        futuresContract.connect(trader1).openPosition(
          CARD_ID,
          0,
          strikePrice,
          quantity,
          duration,
          { value: insufficientCollateral }
        )
      ).to.be.revertedWith("Insufficient collateral");
    });

    it("Should revert if duration is invalid", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const invalidDuration = 1000; // Too short

      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await expect(
        futuresContract.connect(trader1).openPosition(
          CARD_ID,
          0,
          strikePrice,
          quantity,
          invalidDuration,
          { value: requiredCollateral }
        )
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("Settling Positions", function () {
    it("Should settle long position with profit", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      // Open position
      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        0, // LONG
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      // Update price to be higher (profit for LONG)
      const newPrice = ethers.parseEther("15");
      await priceOracle.updatePrice(CARD_ID, newPrice, 95);

      // Fast forward time
      await time.increase(duration + 1);

      // Settle position
      await expect(
        futuresContract.settlePosition(1)
      ).to.emit(futuresContract, "PositionSettled");

      const position = await futuresContract.getPosition(1);
      expect(position[7]).to.equal(1); // Status should be SETTLED
    });

    it("Should settle short position with profit", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      // Open SHORT position
      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        1, // SHORT
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      // Update price to be lower (profit for SHORT)
      const newPrice = ethers.parseEther("5");
      await priceOracle.updatePrice(CARD_ID, newPrice, 95);

      await time.increase(duration + 1);

      await futuresContract.settlePosition(1);

      const position = await futuresContract.getPosition(1);
      expect(position[7]).to.equal(1); // SETTLED
    });

    it("Should revert if trying to settle before expiry", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        0,
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      await expect(
        futuresContract.settlePosition(1)
      ).to.be.revertedWith("Position not expired yet");
    });
  });

  describe("P&L Calculations", function () {
    it("Should calculate unrealized P&L for long position", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 7 * 24 * 60 * 60;
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        0, // LONG
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      // Update price to 15 ETH (5 ETH profit)
      const newPrice = ethers.parseEther("15");
      await priceOracle.updatePrice(CARD_ID, newPrice, 95);

      const pnl = await futuresContract.getUnrealizedPnL(1);
      const expectedPnL = ethers.parseEther("5"); // 15 - 10 = 5 profit

      expect(pnl).to.equal(expectedPnL);
    });
  });

  describe("Liquidation", function () {
    it("Should liquidate undercollateralized position", async function () {
      const strikePrice = ethers.parseEther("10");
      const quantity = 1n;
      const duration = 30 * 24 * 60 * 60;
      const requiredCollateral = (strikePrice * quantity * 20n) / 100n;

      await futuresContract.connect(trader1).openPosition(
        CARD_ID,
        0, // LONG
        strikePrice,
        quantity,
        duration,
        { value: requiredCollateral }
      );

      // Update price to cause massive loss
      const newPrice = ethers.parseEther("2");
      await priceOracle.updatePrice(CARD_ID, newPrice, 95);

      const canLiquidate = await futuresContract.canLiquidate(1);
      expect(canLiquidate).to.be.true;

      await expect(
        futuresContract.liquidatePosition(1)
      ).to.emit(futuresContract, "PositionLiquidated");
    });
  });
});
