// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceOracle.sol";

/**
 * @title SwapsContract
 * @dev Swaps contract for TCG card derivatives trading
 * Allows two parties to exchange cash flows based on card price movements
 * Perfect for hedging while maintaining card ownership
 */
contract SwapsContract {
    // Swap status
    enum SwapStatus { PENDING, ACTIVE, SETTLED, CANCELLED }

    // Swap structure
    struct Swap {
        uint256 swapId;                 // Unique swap ID
        address partyA;                 // First party
        address partyB;                 // Second party
        string cardIdA;                 // Card A identifier
        string cardIdB;                 // Card B identifier
        uint256 notionalValueA;         // Notional value for Card A
        uint256 notionalValueB;         // Notional value for Card B
        uint256 startPriceA;            // Starting price of Card A
        uint256 startPriceB;            // Starting price of Card B
        uint256 collateralA;            // Collateral from Party A
        uint256 collateralB;            // Collateral from Party B
        uint256 maturityDate;           // Settlement date
        uint256 createdAt;              // Creation timestamp
        SwapStatus status;              // Current status
        uint256 settlementPriceA;       // Settlement price Card A
        uint256 settlementPriceB;       // Settlement price Card B
        int256 netPaymentToA;           // Net payment to Party A (negative = payment from A)
    }

    // Reference to price oracle
    PriceOracle public priceOracle;

    // Collateral ratio (percentage)
    uint256 public collateralRatio = 15;

    // Minimum swap duration
    uint256 public constant MIN_DURATION = 1 days;

    // Maximum swap duration
    uint256 public constant MAX_DURATION = 365 days;

    // Swap counter
    uint256 private _swapCounter;

    // Mapping of swap ID to swap data
    mapping(uint256 => Swap) public swaps;

    // Mapping of address to their swap IDs
    mapping(address => uint256[]) public userSwaps;

    // Total collateral locked
    uint256 public totalCollateralLocked;

    // Events
    event SwapProposed(
        uint256 indexed swapId,
        address indexed partyA,
        string cardIdA,
        string cardIdB,
        uint256 notionalValueA,
        uint256 notionalValueB,
        uint256 maturityDate
    );
    event SwapAccepted(
        uint256 indexed swapId,
        address indexed partyB
    );
    event SwapSettled(
        uint256 indexed swapId,
        uint256 settlementPriceA,
        uint256 settlementPriceB,
        int256 netPayment
    );
    event SwapCancelled(uint256 indexed swapId);
    event CollateralDeposited(uint256 indexed swapId, address indexed party, uint256 amount);

    constructor(address _priceOracle) {
        require(_priceOracle != address(0), "Invalid oracle address");
        priceOracle = PriceOracle(_priceOracle);
    }

    /**
     * @dev Propose a new swap
     * @param _cardIdA Card A identifier (proposer's reference card)
     * @param _cardIdB Card B identifier (counterparty's reference card)
     * @param _notionalValueA Notional value for Card A
     * @param _notionalValueB Notional value for Card B
     * @param _duration Duration until maturity
     */
    function proposeSwap(
        string memory _cardIdA,
        string memory _cardIdB,
        uint256 _notionalValueA,
        uint256 _notionalValueB,
        uint256 _duration
    ) external payable returns (uint256) {
        require(_notionalValueA > 0, "Notional value A must be positive");
        require(_notionalValueB > 0, "Notional value B must be positive");
        require(_duration >= MIN_DURATION && _duration <= MAX_DURATION, "Invalid duration");

        // Get current prices
        (uint256 priceA, , ) = priceOracle.getPrice(_cardIdA);
        (uint256 priceB, , ) = priceOracle.getPrice(_cardIdB);
        require(priceA > 0 && priceB > 0, "Prices not available");

        // Calculate required collateral for Party A
        uint256 requiredCollateral = calculateRequiredCollateral(_notionalValueA);
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Create swap
        _swapCounter++;
        uint256 swapId = _swapCounter;
        uint256 maturityDate = block.timestamp + _duration;

        swaps[swapId] = Swap({
            swapId: swapId,
            partyA: msg.sender,
            partyB: address(0),         // No counterparty yet
            cardIdA: _cardIdA,
            cardIdB: _cardIdB,
            notionalValueA: _notionalValueA,
            notionalValueB: _notionalValueB,
            startPriceA: priceA,
            startPriceB: priceB,
            collateralA: msg.value,
            collateralB: 0,
            maturityDate: maturityDate,
            createdAt: block.timestamp,
            status: SwapStatus.PENDING,
            settlementPriceA: 0,
            settlementPriceB: 0,
            netPaymentToA: 0
        });

        userSwaps[msg.sender].push(swapId);
        totalCollateralLocked += msg.value;

        emit SwapProposed(
            swapId,
            msg.sender,
            _cardIdA,
            _cardIdB,
            _notionalValueA,
            _notionalValueB,
            maturityDate
        );
        emit CollateralDeposited(swapId, msg.sender, msg.value);

        return swapId;
    }

    /**
     * @dev Accept a proposed swap
     * @param _swapId Swap to accept
     */
    function acceptSwap(uint256 _swapId) external payable {
        Swap storage swap = swaps[_swapId];

        require(swap.partyA != address(0), "Swap does not exist");
        require(swap.status == SwapStatus.PENDING, "Swap not pending");
        require(msg.sender != swap.partyA, "Cannot accept your own swap");

        // Calculate required collateral for Party B
        uint256 requiredCollateral = calculateRequiredCollateral(swap.notionalValueB);
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Update swap
        swap.partyB = msg.sender;
        swap.collateralB = msg.value;
        swap.status = SwapStatus.ACTIVE;

        userSwaps[msg.sender].push(_swapId);
        totalCollateralLocked += msg.value;

        emit SwapAccepted(_swapId, msg.sender);
        emit CollateralDeposited(_swapId, msg.sender, msg.value);
    }

    /**
     * @dev Settle a swap at maturity
     * @param _swapId Swap to settle
     */
    function settleSwap(uint256 _swapId) external {
        Swap storage swap = swaps[_swapId];

        require(swap.partyA != address(0), "Swap does not exist");
        require(swap.status == SwapStatus.ACTIVE, "Swap not active");
        require(block.timestamp >= swap.maturityDate, "Swap not matured yet");

        // Get settlement prices
        (uint256 settlementPriceA, , ) = priceOracle.getPrice(swap.cardIdA);
        (uint256 settlementPriceB, , ) = priceOracle.getPrice(swap.cardIdB);
        require(settlementPriceA > 0 && settlementPriceB > 0, "Settlement prices not available");

        // Calculate price changes
        int256 changeA = int256(settlementPriceA) - int256(swap.startPriceA);
        int256 changeB = int256(settlementPriceB) - int256(swap.startPriceB);

        // Calculate payments based on price changes
        // Party A receives payment based on Card A performance
        // Party B receives payment based on Card B performance
        int256 paymentA = (changeA * int256(swap.notionalValueA)) / int256(swap.startPriceA);
        int256 paymentB = (changeB * int256(swap.notionalValueB)) / int256(swap.startPriceB);

        // Net payment to A (positive = A receives, negative = A pays)
        int256 netPayment = paymentA - paymentB;

        // Update swap
        swap.status = SwapStatus.SETTLED;
        swap.settlementPriceA = settlementPriceA;
        swap.settlementPriceB = settlementPriceB;
        swap.netPaymentToA = netPayment;

        // Calculate payouts
        uint256 payoutA = swap.collateralA;
        uint256 payoutB = swap.collateralB;

        if (netPayment > 0) {
            // Party A receives, Party B pays
            uint256 payment = uint256(netPayment);
            if (payment >= payoutB) {
                // B loses all collateral
                payoutA += payoutB;
                payoutB = 0;
            } else {
                payoutA += payment;
                payoutB -= payment;
            }
        } else if (netPayment < 0) {
            // Party B receives, Party A pays
            uint256 payment = uint256(-netPayment);
            if (payment >= payoutA) {
                // A loses all collateral
                payoutB += payoutA;
                payoutA = 0;
            } else {
                payoutB += payment;
                payoutA -= payment;
            }
        }

        // Release collateral
        totalCollateralLocked -= (swap.collateralA + swap.collateralB);

        // Transfer payouts
        if (payoutA > 0) {
            (bool successA, ) = payable(swap.partyA).call{value: payoutA}("");
            require(successA, "Payout to Party A failed");
        }

        if (payoutB > 0) {
            (bool successB, ) = payable(swap.partyB).call{value: payoutB}("");
            require(successB, "Payout to Party B failed");
        }

        emit SwapSettled(_swapId, settlementPriceA, settlementPriceB, netPayment);
    }

    /**
     * @dev Cancel a pending swap (only by proposer)
     * @param _swapId Swap to cancel
     */
    function cancelSwap(uint256 _swapId) external {
        Swap storage swap = swaps[_swapId];

        require(swap.partyA == msg.sender, "Only proposer can cancel");
        require(swap.status == SwapStatus.PENDING, "Can only cancel pending swaps");

        swap.status = SwapStatus.CANCELLED;

        // Return collateral to Party A
        totalCollateralLocked -= swap.collateralA;

        (bool success, ) = payable(swap.partyA).call{value: swap.collateralA}("");
        require(success, "Collateral return failed");

        emit SwapCancelled(_swapId);
    }

    /**
     * @dev Calculate required collateral
     */
    function calculateRequiredCollateral(uint256 _notionalValue) public view returns (uint256) {
        return (_notionalValue * collateralRatio) / 100;
    }

    /**
     * @dev Get current unrealized P&L for a swap
     */
    function getUnrealizedPnL(uint256 _swapId) public view returns (int256 pnlA, int256 pnlB) {
        Swap memory swap = swaps[_swapId];
        require(swap.partyA != address(0), "Swap does not exist");

        if (swap.status != SwapStatus.ACTIVE) {
            if (swap.status == SwapStatus.SETTLED) {
                return (swap.netPaymentToA, -swap.netPaymentToA);
            }
            return (0, 0);
        }

        // Get current prices
        uint256 currentPriceA = priceOracle.getLatestPrice(swap.cardIdA);
        uint256 currentPriceB = priceOracle.getLatestPrice(swap.cardIdB);

        if (currentPriceA == 0 || currentPriceB == 0) return (0, 0);

        // Calculate current P&L
        int256 changeA = int256(currentPriceA) - int256(swap.startPriceA);
        int256 changeB = int256(currentPriceB) - int256(swap.startPriceB);

        pnlA = (changeA * int256(swap.notionalValueA)) / int256(swap.startPriceA);
        pnlB = (changeB * int256(swap.notionalValueB)) / int256(swap.startPriceB);

        return (pnlA - pnlB, pnlB - pnlA);
    }

    /**
     * @dev Get user's swaps
     */
    function getUserSwaps(address _user) external view returns (uint256[] memory) {
        return userSwaps[_user];
    }

    /**
     * @dev Get swap details
     */
    function getSwap(uint256 _swapId) external view returns (
        address partyA,
        address partyB,
        string memory cardIdA,
        string memory cardIdB,
        uint256 notionalValueA,
        uint256 notionalValueB,
        uint256 maturityDate,
        SwapStatus status,
        int256 currentPnLA
    ) {
        Swap memory swap = swaps[_swapId];
        require(swap.partyA != address(0), "Swap does not exist");

        (int256 pnlA, ) = getUnrealizedPnL(_swapId);

        return (
            swap.partyA,
            swap.partyB,
            swap.cardIdA,
            swap.cardIdB,
            swap.notionalValueA,
            swap.notionalValueB,
            swap.maturityDate,
            swap.status,
            pnlA
        );
    }

    /**
     * @dev Update collateral ratio
     */
    function updateCollateralRatio(uint256 _newRatio) external {
        require(_newRatio >= 10 && _newRatio <= 50, "Invalid ratio");
        collateralRatio = _newRatio;
    }

    /**
     * @dev Get all active swaps for matching
     */
    function getActiveSwaps(uint256 _offset, uint256 _limit) external view returns (uint256[] memory) {
        uint256[] memory activeSwaps = new uint256[](_limit);
        uint256 count = 0;
        uint256 currentOffset = 0;

        for (uint256 i = 1; i <= _swapCounter && count < _limit; i++) {
            if (swaps[i].status == SwapStatus.PENDING) {
                if (currentOffset >= _offset) {
                    activeSwaps[count] = i;
                    count++;
                }
                currentOffset++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeSwaps[i];
        }

        return result;
    }
}
