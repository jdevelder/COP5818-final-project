const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PriceOracle", function () {
  let priceOracle;
  let owner, updater, user;

  beforeEach(async function () {
    [owner, updater, user] = await ethers.getSigners();

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();
  });

  describe("Price Management", function () {
    it("Should allow owner to update price", async function () {
      const price = ethers.parseEther("10");
      await priceOracle.updatePrice("Charizard-BaseSet-Rare", price, 95);

      const priceData = await priceOracle.getPrice("Charizard-BaseSet-Rare");
      expect(priceData[0]).to.equal(price);
      expect(priceData[2]).to.equal(95); // confidence
    });

    it("Should revert if non-updater tries to update price", async function () {
      const price = ethers.parseEther("10");

      await expect(
        priceOracle.connect(user).updatePrice("Card-Set-Rare", price, 95)
      ).to.be.revertedWith("Not authorized to update prices");
    });

    it("Should add price to history", async function () {
      const price = ethers.parseEther("10");
      await priceOracle.updatePrice("Charizard-BaseSet-Rare", price, 95);

      const history = await priceOracle.getPriceHistory("Charizard-BaseSet-Rare");
      expect(history.length).to.equal(1);
      expect(history[0].price).to.equal(price);
    });

    it("Should batch update prices", async function () {
      const prices = [ethers.parseEther("10"), ethers.parseEther("20")];
      const confidences = [95, 90];
      const cardIds = ["Card1-Set-Rare", "Card2-Set-Rare"];

      await priceOracle.updatePrices(cardIds, prices, confidences);

      const price1 = await priceOracle.getLatestPrice("Card1-Set-Rare");
      const price2 = await priceOracle.getLatestPrice("Card2-Set-Rare");

      expect(price1).to.equal(prices[0]);
      expect(price2).to.equal(prices[1]);
    });
  });

  describe("Price Updater Management", function () {
    it("Should add price updater", async function () {
      await priceOracle.addPriceUpdater(updater.address);

      expect(await priceOracle.priceUpdaters(updater.address)).to.be.true;
    });

    it("Should allow new updater to update prices", async function () {
      await priceOracle.addPriceUpdater(updater.address);

      const price = ethers.parseEther("10");
      await priceOracle.connect(updater).updatePrice("Card-Set-Rare", price, 95);

      const latestPrice = await priceOracle.getLatestPrice("Card-Set-Rare");
      expect(latestPrice).to.equal(price);
    });

    it("Should remove price updater", async function () {
      await priceOracle.addPriceUpdater(updater.address);
      await priceOracle.removePriceUpdater(updater.address);

      expect(await priceOracle.priceUpdaters(updater.address)).to.be.false;
    });
  });

  describe("Price History", function () {
    it("Should calculate average price", async function () {
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("10"), 95);
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("20"), 95);
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("30"), 95);

      const avgPrice = await priceOracle.getAveragePrice("Card-Set-Rare", 3);
      expect(avgPrice).to.equal(ethers.parseEther("20")); // (10+20+30)/3 = 20
    });

    it("Should check if price is stale", async function () {
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("10"), 95);

      // Just updated, should not be stale
      expect(await priceOracle.isPriceStale("Card-Set-Rare", 3600)).to.be.false;
    });
  });

  describe("Price Feed Control", function () {
    it("Should activate price feed", async function () {
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("10"), 95);
      await priceOracle.deactivatePriceFeed("Card-Set-Rare");
      await priceOracle.activatePriceFeed("Card-Set-Rare");

      // Should be able to get price after activation
      const priceData = await priceOracle.getPrice("Card-Set-Rare");
      expect(priceData[0]).to.equal(ethers.parseEther("10"));
    });

    it("Should revert when getting deactivated price feed", async function () {
      await priceOracle.updatePrice("Card-Set-Rare", ethers.parseEther("10"), 95);
      await priceOracle.deactivatePriceFeed("Card-Set-Rare");

      await expect(
        priceOracle.getPrice("Card-Set-Rare")
      ).to.be.revertedWith("Price feed not active");
    });
  });
});
