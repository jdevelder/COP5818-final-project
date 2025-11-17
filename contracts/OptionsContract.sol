// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceOracle.sol";

/**
 * @title OptionsContract
 * @dev Options contract for TCG card derivatives trading
 * Provides Call and Put options for TCG cards
 */
contract OptionsContract {
    // Option types
    enum OptionType { CALL, PUT }

    // Option status
    enum OptionStatus { ACTIVE, EXERCISED, EXPIRED, CANCELLED }

    // Option contract structure
    struct Option {
        uint256 optionId;           // Unique option ID
        address buyer;              // Option buyer (holder)
        address seller;             // Option seller (writer)
        string cardId;              // Card identifier
        OptionType optionType;      // CALL or PUT
        uint256 strikePrice;        // Exercise price
        uint256 premium;            // Premium paid by buyer
        uint256 quantity;           // Number of contracts
        uint256 expiryDate;         // Expiry timestamp
        uint256 createdAt;          // Creation timestamp
        OptionStatus status;        // Current status
        uint256 exercisedPrice;     // Price at exercise
        uint256 collateral;         // Collateral from seller
    }

    // Reference to price oracle
    PriceOracle public priceOracle;

    // Seller collateral ratio (percentage)
    uint256 public sellerCollateralRatio = 100;

    // Platform fee (percentage)
    uint256 public platformFee = 2; // 2%

    // Platform fee collector
    address public feeCollector;

    // Minimum contract duration
    uint256 public constant MIN_DURATION = 1 days;

    // Maximum contract duration
    uint256 public constant MAX_DURATION = 365 days;

    // Option counter
    uint256 private _optionCounter;

    // Mapping of option ID to option data
    mapping(uint256 => Option) public options;

    // Mapping of address to their option IDs (buyer)
    mapping(address => uint256[]) public buyerOptions;

    // Mapping of address to their option IDs (seller)
    mapping(address => uint256[]) public sellerOptions;

    // Total collateral locked
    uint256 public totalCollateralLocked;

    // Events
    event OptionCreated(
        uint256 indexed optionId,
        address indexed seller,
        string cardId,
        OptionType optionType,
        uint256 strikePrice,
        uint256 premium,
        uint256 expiryDate
    );
    event OptionPurchased(
        uint256 indexed optionId,
        address indexed buyer,
        uint256 premium
    );
    event OptionExercised(
        uint256 indexed optionId,
        address indexed buyer,
        uint256 exercisePrice,
        uint256 payout
    );
    event OptionExpired(uint256 indexed optionId);
    event CollateralDeposited(uint256 indexed optionId, uint256 amount);
    event CollateralReleased(uint256 indexed optionId, address indexed seller, uint256 amount);

    constructor(address _priceOracle, address _feeCollector) {
        require(_priceOracle != address(0), "Invalid oracle address");
        require(_feeCollector != address(0), "Invalid fee collector address");
        priceOracle = PriceOracle(_priceOracle);
        feeCollector = _feeCollector;
    }

    /**
     * @dev Create a new option (seller creates and locks collateral)
     * @param _cardId Card identifier
     * @param _optionType CALL or PUT
     * @param _strikePrice Exercise price
     * @param _premium Premium amount
     * @param _quantity Number of contracts
     * @param _duration Duration until expiry
     */
    function createOption(
        string memory _cardId,
        OptionType _optionType,
        uint256 _strikePrice,
        uint256 _premium,
        uint256 _quantity,
        uint256 _duration
    ) external payable returns (uint256) {
        require(_strikePrice > 0, "Strike price must be positive");
        require(_premium > 0, "Premium must be positive");
        require(_quantity > 0, "Quantity must be positive");
        require(_duration >= MIN_DURATION && _duration <= MAX_DURATION, "Invalid duration");

        // Get current price
        (uint256 currentPrice, , ) = priceOracle.getPrice(_cardId);
        require(currentPrice > 0, "Card price not available");

        // Calculate required collateral
        uint256 requiredCollateral = calculateSellerCollateral(_strikePrice, _quantity);
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Create option
        _optionCounter++;
        uint256 optionId = _optionCounter;
        uint256 expiryDate = block.timestamp + _duration;

        options[optionId] = Option({
            optionId: optionId,
            buyer: address(0),          // No buyer yet
            seller: msg.sender,
            cardId: _cardId,
            optionType: _optionType,
            strikePrice: _strikePrice,
            premium: _premium,
            quantity: _quantity,
            expiryDate: expiryDate,
            createdAt: block.timestamp,
            status: OptionStatus.ACTIVE,
            exercisedPrice: 0,
            collateral: msg.value
        });

        sellerOptions[msg.sender].push(optionId);
        totalCollateralLocked += msg.value;

        emit OptionCreated(
            optionId,
            msg.sender,
            _cardId,
            _optionType,
            _strikePrice,
            _premium,
            expiryDate
        );
        emit CollateralDeposited(optionId, msg.value);

        return optionId;
    }

    /**
     * @dev Purchase an option
     * @param _optionId Option to purchase
     */
    function purchaseOption(uint256 _optionId) external payable {
        Option storage option = options[_optionId];

        require(option.seller != address(0), "Option does not exist");
        require(option.buyer == address(0), "Option already purchased");
        require(option.status == OptionStatus.ACTIVE, "Option not active");
        require(block.timestamp < option.expiryDate, "Option expired");
        require(msg.sender != option.seller, "Cannot buy your own option");
        require(msg.value >= option.premium, "Insufficient premium");

        // Calculate platform fee
        uint256 fee = (option.premium * platformFee) / 100;
        uint256 sellerProceeds = option.premium - fee;

        // Update option
        option.buyer = msg.sender;
        buyerOptions[msg.sender].push(_optionId);

        // Transfer premium to seller (minus fee)
        (bool successSeller, ) = payable(option.seller).call{value: sellerProceeds}("");
        require(successSeller, "Premium transfer to seller failed");

        // Transfer fee to fee collector
        (bool successFee, ) = payable(feeCollector).call{value: fee}("");
        require(successFee, "Fee transfer failed");

        emit OptionPurchased(_optionId, msg.sender, option.premium);
    }

    /**
     * @dev Exercise an option
     * @param _optionId Option to exercise
     */
    function exerciseOption(uint256 _optionId) external {
        Option storage option = options[_optionId];

        require(option.buyer == msg.sender, "Only buyer can exercise");
        require(option.status == OptionStatus.ACTIVE, "Option not active");
        require(block.timestamp < option.expiryDate, "Option expired");

        // Get current price
        (uint256 currentPrice, , ) = priceOracle.getPrice(option.cardId);
        require(currentPrice > 0, "Price not available");

        // Check if option is in the money
        bool inTheMoney = false;
        uint256 payout = 0;

        if (option.optionType == OptionType.CALL) {
            // Call option: profitable when current > strike
            if (currentPrice > option.strikePrice) {
                inTheMoney = true;
                payout = (currentPrice - option.strikePrice) * option.quantity;
            }
        } else {
            // Put option: profitable when current < strike
            if (currentPrice < option.strikePrice) {
                inTheMoney = true;
                payout = (option.strikePrice - currentPrice) * option.quantity;
            }
        }

        require(inTheMoney, "Option not in the money");

        // Update option
        option.status = OptionStatus.EXERCISED;
        option.exercisedPrice = currentPrice;

        // Calculate actual payout (capped at collateral)
        uint256 actualPayout = payout > option.collateral ? option.collateral : payout;
        uint256 remainingCollateral = option.collateral - actualPayout;

        // Release collateral
        totalCollateralLocked -= option.collateral;

        // Transfer payout to buyer
        (bool successBuyer, ) = payable(option.buyer).call{value: actualPayout}("");
        require(successBuyer, "Payout to buyer failed");

        // Return remaining collateral to seller
        if (remainingCollateral > 0) {
            (bool successSeller, ) = payable(option.seller).call{value: remainingCollateral}("");
            require(successSeller, "Return to seller failed");
        }

        emit OptionExercised(_optionId, option.buyer, currentPrice, actualPayout);
    }

    /**
     * @dev Expire an option (callable by anyone after expiry)
     * @param _optionId Option to expire
     */
    function expireOption(uint256 _optionId) external {
        Option storage option = options[_optionId];

        require(option.seller != address(0), "Option does not exist");
        require(option.status == OptionStatus.ACTIVE, "Option not active");
        require(block.timestamp >= option.expiryDate, "Option not expired yet");

        option.status = OptionStatus.EXPIRED;

        // Release collateral back to seller
        totalCollateralLocked -= option.collateral;

        (bool success, ) = payable(option.seller).call{value: option.collateral}("");
        require(success, "Collateral return failed");

        emit OptionExpired(_optionId);
        emit CollateralReleased(_optionId, option.seller, option.collateral);
    }

    /**
     * @dev Calculate required collateral for seller
     */
    function calculateSellerCollateral(uint256 _strikePrice, uint256 _quantity) public view returns (uint256) {
        return (_strikePrice * _quantity * sellerCollateralRatio) / 100;
    }

    /**
     * @dev Calculate option value (intrinsic + time value approximation)
     */
    function calculateOptionValue(uint256 _optionId) external view returns (uint256 intrinsicValue, uint256 timeValue) {
        Option memory option = options[_optionId];
        require(option.seller != address(0), "Option does not exist");

        if (option.status != OptionStatus.ACTIVE) {
            return (0, 0);
        }

        // Get current price
        uint256 currentPrice = priceOracle.getLatestPrice(option.cardId);
        if (currentPrice == 0) return (0, 0);

        // Calculate intrinsic value
        if (option.optionType == OptionType.CALL) {
            if (currentPrice > option.strikePrice) {
                intrinsicValue = (currentPrice - option.strikePrice) * option.quantity;
            }
        } else {
            if (currentPrice < option.strikePrice) {
                intrinsicValue = (option.strikePrice - currentPrice) * option.quantity;
            }
        }

        // Simple time value calculation
        if (block.timestamp < option.expiryDate) {
            uint256 timeRemaining = option.expiryDate - block.timestamp;
            uint256 totalTime = option.expiryDate - option.createdAt;
            timeValue = (option.premium * timeRemaining) / totalTime;
        }

        return (intrinsicValue, timeValue);
    }

    /**
     * @dev Check if option is in the money
     */
    function isInTheMoney(uint256 _optionId) external view returns (bool) {
        Option memory option = options[_optionId];
        require(option.seller != address(0), "Option does not exist");

        uint256 currentPrice = priceOracle.getLatestPrice(option.cardId);
        if (currentPrice == 0) return false;

        if (option.optionType == OptionType.CALL) {
            return currentPrice > option.strikePrice;
        } else {
            return currentPrice < option.strikePrice;
        }
    }

    /**
     * @dev Get buyer's options
     */
    function getBuyerOptions(address _buyer) external view returns (uint256[] memory) {
        return buyerOptions[_buyer];
    }

    /**
     * @dev Get seller's options
     */
    function getSellerOptions(address _seller) external view returns (uint256[] memory) {
        return sellerOptions[_seller];
    }

    /**
     * @dev Get option details
     */
    function getOption(uint256 _optionId) external view returns (
        address buyer,
        address seller,
        string memory cardId,
        OptionType optionType,
        uint256 strikePrice,
        uint256 premium,
        uint256 quantity,
        uint256 expiryDate,
        OptionStatus status
    ) {
        Option memory option = options[_optionId];
        require(option.seller != address(0), "Option does not exist");

        return (
            option.buyer,
            option.seller,
            option.cardId,
            option.optionType,
            option.strikePrice,
            option.premium,
            option.quantity,
            option.expiryDate,
            option.status
        );
    }

    /**
     * @dev Update seller collateral ratio
     */
    function updateSellerCollateralRatio(uint256 _newRatio) external {
        require(_newRatio >= 50 && _newRatio <= 200, "Invalid ratio");
        sellerCollateralRatio = _newRatio;
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _newFee) external {
        require(_newFee <= 10, "Fee too high");
        platformFee = _newFee;
    }
}
