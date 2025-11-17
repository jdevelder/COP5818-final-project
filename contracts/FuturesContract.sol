// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceOracle.sol";

/**
 * @title FuturesContract
 * @dev Futures contract for TCG card derivatives trading
 * Allows traders to lock in prices for future card transactions while maintaining card ownership
 */
contract FuturesContract {
    // Position types
    enum PositionType { LONG, SHORT }

    // Position status
    enum PositionStatus { ACTIVE, SETTLED, LIQUIDATED, CANCELLED }

    // Futures position structure
    struct FuturesPosition {
        uint256 positionId;         // Unique position ID
        address trader;             // Position holder
        string cardId;              // Card identifier (e.g., "Charizard-BaseSet-Rare")
        PositionType positionType;  // LONG or SHORT
        uint256 strikePrice;        // Agreed upon price
        uint256 quantity;           // Number of contracts (1 contract = 1 card)
        uint256 collateral;         // Collateral deposited
        uint256 expiryDate;         // Expiry timestamp
        uint256 createdAt;          // Creation timestamp
        PositionStatus status;      // Current status
        uint256 settledPrice;       // Price at settlement
        int256 profitLoss;          // Profit/Loss after settlement
    }

    // Reference to price oracle
    PriceOracle public priceOracle;

    // Collateral ratio (percentage) - e.g., 20 = 20%
    uint256 public collateralRatio = 20;

    // Minimum contract duration (1 day)
    uint256 public constant MIN_DURATION = 1 days;

    // Maximum contract duration (1 year)
    uint256 public constant MAX_DURATION = 365 days;

    // Position counter
    uint256 private _positionCounter;

    // Mapping of position ID to position data
    mapping(uint256 => FuturesPosition) public positions;

    // Mapping of trader to their position IDs
    mapping(address => uint256[]) public traderPositions;

    // Total collateral locked in contract
    uint256 public totalCollateralLocked;

    // Events
    event PositionOpened(
        uint256 indexed positionId,
        address indexed trader,
        string cardId,
        PositionType positionType,
        uint256 strikePrice,
        uint256 quantity,
        uint256 expiryDate
    );
    event PositionSettled(
        uint256 indexed positionId,
        address indexed trader,
        uint256 settledPrice,
        int256 profitLoss
    );
    event PositionLiquidated(uint256 indexed positionId, address indexed trader);
    event PositionCancelled(uint256 indexed positionId, address indexed trader);
    event CollateralDeposited(uint256 indexed positionId, uint256 amount);
    event CollateralWithdrawn(address indexed trader, uint256 amount);

    constructor(address _priceOracle) {
        require(_priceOracle != address(0), "Invalid oracle address");
        priceOracle = PriceOracle(_priceOracle);
    }

    /**
     * @dev Open a new futures position
     * @param _cardId Card identifier
     * @param _positionType LONG or SHORT
     * @param _strikePrice Agreed price for the card
     * @param _quantity Number of contracts
     * @param _duration Duration until expiry (in seconds)
     */
    function openPosition(
        string memory _cardId,
        PositionType _positionType,
        uint256 _strikePrice,
        uint256 _quantity,
        uint256 _duration
    ) external payable returns (uint256) {
        require(_strikePrice > 0, "Strike price must be positive");
        require(_quantity > 0, "Quantity must be positive");
        require(_duration >= MIN_DURATION && _duration <= MAX_DURATION, "Invalid duration");

        // Get current price from oracle
        (uint256 currentPrice, , ) = priceOracle.getPrice(_cardId);
        require(currentPrice > 0, "Card price not available");

        // Calculate required collateral
        uint256 requiredCollateral = calculateRequiredCollateral(_strikePrice, _quantity);
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Create position
        _positionCounter++;
        uint256 positionId = _positionCounter;
        uint256 expiryDate = block.timestamp + _duration;

        positions[positionId] = FuturesPosition({
            positionId: positionId,
            trader: msg.sender,
            cardId: _cardId,
            positionType: _positionType,
            strikePrice: _strikePrice,
            quantity: _quantity,
            collateral: msg.value,
            expiryDate: expiryDate,
            createdAt: block.timestamp,
            status: PositionStatus.ACTIVE,
            settledPrice: 0,
            profitLoss: 0
        });

        traderPositions[msg.sender].push(positionId);
        totalCollateralLocked += msg.value;

        emit PositionOpened(
            positionId,
            msg.sender,
            _cardId,
            _positionType,
            _strikePrice,
            _quantity,
            expiryDate
        );
        emit CollateralDeposited(positionId, msg.value);

        return positionId;
    }

    /**
     * @dev Settle a futures position at expiry
     * @param _positionId Position to settle
     */
    function settlePosition(uint256 _positionId) external {
        FuturesPosition storage position = positions[_positionId];

        require(position.trader != address(0), "Position does not exist");
        require(position.status == PositionStatus.ACTIVE, "Position not active");
        require(block.timestamp >= position.expiryDate, "Position not expired yet");

        // Get settlement price from oracle
        (uint256 settlementPrice, , ) = priceOracle.getPrice(position.cardId);
        require(settlementPrice > 0, "Settlement price not available");

        // Calculate profit/loss
        int256 profitLoss = calculateProfitLoss(
            position.positionType,
            position.strikePrice,
            settlementPrice,
            position.quantity
        );

        // Update position
        position.status = PositionStatus.SETTLED;
        position.settledPrice = settlementPrice;
        position.profitLoss = profitLoss;

        // Calculate payout
        uint256 payout = position.collateral;
        if (profitLoss > 0) {
            // Profit - add to collateral
            payout += uint256(profitLoss);
        } else if (profitLoss < 0) {
            // Loss - deduct from collateral
            uint256 loss = uint256(-profitLoss);
            if (loss >= payout) {
                payout = 0; // Total loss
            } else {
                payout -= loss;
            }
        }

        // Release collateral
        totalCollateralLocked -= position.collateral;

        // Transfer payout to trader
        if (payout > 0) {
            (bool success, ) = payable(position.trader).call{value: payout}("");
            require(success, "Payout transfer failed");
        }

        emit PositionSettled(_positionId, position.trader, settlementPrice, profitLoss);
    }

    /**
     * @dev Calculate required collateral for a position
     */
    function calculateRequiredCollateral(uint256 _strikePrice, uint256 _quantity) public view returns (uint256) {
        return (_strikePrice * _quantity * collateralRatio) / 100;
    }

    /**
     * @dev Calculate profit/loss for a position
     */
    function calculateProfitLoss(
        PositionType _positionType,
        uint256 _strikePrice,
        uint256 _settlementPrice,
        uint256 _quantity
    ) public pure returns (int256) {
        int256 priceDiff;

        if (_positionType == PositionType.LONG) {
            // Long: profit when settlement > strike
            priceDiff = int256(_settlementPrice) - int256(_strikePrice);
        } else {
            // Short: profit when settlement < strike
            priceDiff = int256(_strikePrice) - int256(_settlementPrice);
        }

        return priceDiff * int256(_quantity);
    }

    /**
     * @dev Get current unrealized P&L for an active position
     */
    function getUnrealizedPnL(uint256 _positionId) public view returns (int256) {
        FuturesPosition memory position = positions[_positionId];
        require(position.trader != address(0), "Position does not exist");
        require(position.status == PositionStatus.ACTIVE, "Position not active");

        // Get current price
        uint256 currentPrice = priceOracle.getLatestPrice(position.cardId);
        if (currentPrice == 0) return 0;

        return calculateProfitLoss(
            position.positionType,
            position.strikePrice,
            currentPrice,
            position.quantity
        );
    }

    /**
     * @dev Check if position can be liquidated
     * Position can be liquidated if losses exceed collateral
     */
    function canLiquidate(uint256 _positionId) public view returns (bool) {
        FuturesPosition memory position = positions[_positionId];
        if (position.status != PositionStatus.ACTIVE) return false;

        int256 unrealizedPnL = getUnrealizedPnL(_positionId);

        // If loss is greater than 80% of collateral, can liquidate
        if (unrealizedPnL < 0) {
            uint256 loss = uint256(-unrealizedPnL);
            uint256 liquidationThreshold = (position.collateral * 80) / 100;
            return loss >= liquidationThreshold;
        }

        return false;
    }

    /**
     * @dev Liquidate an undercollateralized position
     */
    function liquidatePosition(uint256 _positionId) external {
        require(canLiquidate(_positionId), "Position cannot be liquidated");

        FuturesPosition storage position = positions[_positionId];
        position.status = PositionStatus.LIQUIDATED;

        // Collateral is forfeited
        totalCollateralLocked -= position.collateral;

        emit PositionLiquidated(_positionId, position.trader);
    }

    /**
     * @dev Get all positions for a trader
     */
    function getTraderPositions(address _trader) external view returns (uint256[] memory) {
        return traderPositions[_trader];
    }

    /**
     * @dev Get position details
     */
    function getPosition(uint256 _positionId) external view returns (
        address trader,
        string memory cardId,
        PositionType positionType,
        uint256 strikePrice,
        uint256 quantity,
        uint256 collateral,
        uint256 expiryDate,
        PositionStatus status,
        int256 currentPnL
    ) {
        FuturesPosition memory position = positions[_positionId];
        require(position.trader != address(0), "Position does not exist");

        int256 pnl = 0;
        if (position.status == PositionStatus.ACTIVE) {
            pnl = getUnrealizedPnL(_positionId);
        } else if (position.status == PositionStatus.SETTLED) {
            pnl = position.profitLoss;
        }

        return (
            position.trader,
            position.cardId,
            position.positionType,
            position.strikePrice,
            position.quantity,
            position.collateral,
            position.expiryDate,
            position.status,
            pnl
        );
    }

    /**
     * @dev Update collateral ratio (admin function)
     */
    function updateCollateralRatio(uint256 _newRatio) external {
        require(_newRatio >= 10 && _newRatio <= 100, "Invalid ratio");
        collateralRatio = _newRatio;
    }
}
