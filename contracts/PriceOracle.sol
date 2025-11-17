// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PriceOracle
 * @dev Oracle contract for TCG card price feeds
 * Provides pricing data for derivatives contracts
 */
contract PriceOracle {
    // Price data structure
    struct PriceData {
        uint256 price;          // Current price in wei
        uint256 timestamp;      // When price was last updated
        uint256 confidence;     // Confidence score (0-100)
        bool isActive;          // Whether this price feed is active
    }

    // Historical price point
    struct PricePoint {
        uint256 price;
        uint256 timestamp;
    }

    // Owner of the oracle (can update prices)
    address public owner;

    // Authorized price updaters
    mapping(address => bool) public priceUpdaters;

    // Card identifier => Price data
    // Card identifier format: "CardName-Set-Rarity" (e.g., "Charizard-BaseSet-Rare")
    mapping(string => PriceData) public prices;

    // Card identifier => Historical prices (limited to last 100 entries)
    mapping(string => PricePoint[]) public priceHistory;

    // Maximum historical entries per card
    uint256 public constant MAX_HISTORY = 100;

    // Events
    event PriceUpdated(string indexed cardId, uint256 price, uint256 timestamp, address updater);
    event PriceUpdaterAdded(address indexed updater);
    event PriceUpdaterRemoved(address indexed updater);
    event PriceFeedActivated(string indexed cardId);
    event PriceFeedDeactivated(string indexed cardId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyPriceUpdater() {
        require(priceUpdaters[msg.sender] || msg.sender == owner, "Not authorized to update prices");
        _;
    }

    constructor() {
        owner = msg.sender;
        priceUpdaters[msg.sender] = true;
    }

    /**
     * @dev Add a new price updater
     */
    function addPriceUpdater(address _updater) external onlyOwner {
        require(_updater != address(0), "Invalid address");
        require(!priceUpdaters[_updater], "Already a price updater");

        priceUpdaters[_updater] = true;
        emit PriceUpdaterAdded(_updater);
    }

    /**
     * @dev Remove a price updater
     */
    function removePriceUpdater(address _updater) external onlyOwner {
        require(priceUpdaters[_updater], "Not a price updater");

        priceUpdaters[_updater] = false;
        emit PriceUpdaterRemoved(_updater);
    }

    /**
     * @dev Update price for a card
     * @param _cardId Unique identifier for the card
     * @param _price New price in wei
     * @param _confidence Confidence score (0-100)
     */
    function updatePrice(
        string memory _cardId,
        uint256 _price,
        uint256 _confidence
    ) external onlyPriceUpdater {
        require(_price > 0, "Price must be greater than zero");
        require(_confidence <= 100, "Confidence must be 0-100");

        // Update current price
        prices[_cardId] = PriceData({
            price: _price,
            timestamp: block.timestamp,
            confidence: _confidence,
            isActive: true
        });

        // Add to price history
        _addToPriceHistory(_cardId, _price);

        emit PriceUpdated(_cardId, _price, block.timestamp, msg.sender);
    }

    /**
     * @dev Batch update prices for multiple cards
     */
    function updatePrices(
        string[] memory _cardIds,
        uint256[] memory _prices,
        uint256[] memory _confidences
    ) external onlyPriceUpdater {
        require(_cardIds.length == _prices.length, "Array length mismatch");
        require(_cardIds.length == _confidences.length, "Array length mismatch");

        for (uint256 i = 0; i < _cardIds.length; i++) {
            require(_prices[i] > 0, "Price must be greater than zero");
            require(_confidences[i] <= 100, "Confidence must be 0-100");

            prices[_cardIds[i]] = PriceData({
                price: _prices[i],
                timestamp: block.timestamp,
                confidence: _confidences[i],
                isActive: true
            });

            _addToPriceHistory(_cardIds[i], _prices[i]);

            emit PriceUpdated(_cardIds[i], _prices[i], block.timestamp, msg.sender);
        }
    }

    /**
     * @dev Get current price for a card
     */
    function getPrice(string memory _cardId) public view returns (uint256 price, uint256 timestamp, uint256 confidence) {
        PriceData memory data = prices[_cardId];
        require(data.isActive, "Price feed not active");
        require(data.timestamp > 0, "Price not set");

        return (data.price, data.timestamp, data.confidence);
    }

    /**
     * @dev Get latest price (without reverting if not found)
     */
    function getLatestPrice(string memory _cardId) public view returns (uint256) {
        return prices[_cardId].price;
    }

    /**
     * @dev Check if price is stale (older than specified duration)
     */
    function isPriceStale(string memory _cardId, uint256 _maxAge) public view returns (bool) {
        PriceData memory data = prices[_cardId];
        if (data.timestamp == 0) return true;
        return (block.timestamp - data.timestamp) > _maxAge;
    }

    /**
     * @dev Get price history for a card
     */
    function getPriceHistory(string memory _cardId) public view returns (PricePoint[] memory) {
        return priceHistory[_cardId];
    }

    /**
     * @dev Get historical price at specific index
     */
    function getHistoricalPrice(string memory _cardId, uint256 _index) public view returns (uint256 price, uint256 timestamp) {
        require(_index < priceHistory[_cardId].length, "Index out of bounds");
        PricePoint memory point = priceHistory[_cardId][_index];
        return (point.price, point.timestamp);
    }

    /**
     * @dev Calculate average price over last N entries
     */
    function getAveragePrice(string memory _cardId, uint256 _periods) public view returns (uint256) {
        PricePoint[] memory history = priceHistory[_cardId];
        require(history.length > 0, "No price history");

        uint256 periods = _periods > history.length ? history.length : _periods;
        uint256 sum = 0;

        // Calculate from most recent entries
        uint256 startIndex = history.length - periods;
        for (uint256 i = startIndex; i < history.length; i++) {
            sum += history[i].price;
        }

        return sum / periods;
    }

    /**
     * @dev Activate a price feed
     */
    function activatePriceFeed(string memory _cardId) external onlyOwner {
        prices[_cardId].isActive = true;
        emit PriceFeedActivated(_cardId);
    }

    /**
     * @dev Deactivate a price feed
     */
    function deactivatePriceFeed(string memory _cardId) external onlyOwner {
        prices[_cardId].isActive = false;
        emit PriceFeedDeactivated(_cardId);
    }

    /**
     * @dev Internal function to add price to history
     */
    function _addToPriceHistory(string memory _cardId, uint256 _price) internal {
        PricePoint[] storage history = priceHistory[_cardId];

        // If we've reached max history, remove oldest entry
        if (history.length >= MAX_HISTORY) {
            // Shift all elements left (remove first element)
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }

        // Add new price point
        history.push(PricePoint({
            price: _price,
            timestamp: block.timestamp
        }));
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
