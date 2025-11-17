const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TCGCardToken", function () {
  let tcgCardToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TCGCardToken = await ethers.getContractFactory("TCGCardToken");
    tcgCardToken = await TCGCardToken.deploy();
    await tcgCardToken.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint a new card", async function () {
      await tcgCardToken.mintCard(
        addr1.address,
        "Charizard",
        "Base Set",
        5, // rarity
        10, // condition
        "ipfs://charizard"
      );

      expect(await tcgCardToken.ownerOf(1)).to.equal(addr1.address);
      expect(await tcgCardToken.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should store correct metadata", async function () {
      await tcgCardToken.mintCard(
        addr1.address,
        "Black Lotus",
        "Alpha",
        5,
        9,
        "ipfs://blacklotus"
      );

      const metadata = await tcgCardToken.getCardMetadata(1);
      expect(metadata[0]).to.equal("Black Lotus"); // name
      expect(metadata[1]).to.equal("Alpha"); // cardSet
      expect(metadata[2]).to.equal(5); // rarity
      expect(metadata[3]).to.equal(9); // condition
      expect(metadata[4]).to.equal("ipfs://blacklotus"); // imageURI
    });

    it("Should revert if minting to zero address", async function () {
      await expect(
        tcgCardToken.mintCard(
          ethers.ZeroAddress,
          "Card",
          "Set",
          1,
          5,
          "ipfs://test"
        )
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should revert if rarity is invalid", async function () {
      await expect(
        tcgCardToken.mintCard(
          addr1.address,
          "Card",
          "Set",
          0, // invalid rarity
          5,
          "ipfs://test"
        )
      ).to.be.revertedWith("Rarity must be between 1-5");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await tcgCardToken.mintCard(
        addr1.address,
        "Charizard",
        "Base Set",
        5,
        10,
        "ipfs://charizard"
      );
    });

    it("Should transfer card from one address to another", async function () {
      await tcgCardToken.connect(addr1).transferFrom(addr1.address, addr2.address, 1);

      expect(await tcgCardToken.ownerOf(1)).to.equal(addr2.address);
      expect(await tcgCardToken.balanceOf(addr1.address)).to.equal(0);
      expect(await tcgCardToken.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should revert if not authorized", async function () {
      await expect(
        tcgCardToken.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await tcgCardToken.mintCard(
        addr1.address,
        "Charizard",
        "Base Set",
        5,
        10,
        "ipfs://charizard"
      );
    });

    it("Should approve address to transfer token", async function () {
      await tcgCardToken.connect(addr1).approve(addr2.address, 1);

      expect(await tcgCardToken.getApproved(1)).to.equal(addr2.address);
    });

    it("Should allow approved address to transfer", async function () {
      await tcgCardToken.connect(addr1).approve(addr2.address, 1);
      await tcgCardToken.connect(addr2).transferFrom(addr1.address, addr2.address, 1);

      expect(await tcgCardToken.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should set approval for all", async function () {
      await tcgCardToken.connect(addr1).setApprovalForAll(addr2.address, true);

      expect(await tcgCardToken.isApprovedForAll(addr1.address, addr2.address)).to.be.true;
    });
  });
});
