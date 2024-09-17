// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LibAppStorage.sol";
import { LibSteez } from "./LibSteez.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { IHooks } from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";
import { BalanceDelta } from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import { CurrencyLibrary, Currency } from "@uniswap/v4-core/src/libraries/CurrencyLibrary.sol";
import { TickMath } from "@uniswap/v4-core/src/libraries/TickMath.sol";
import { PoolIdLibrary } from "@uniswap/v4-core/src/libraries/PoolIdLibrary.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

library LibBazaarRouter{
    using SafeERC20 for IERC20;
    using CurrencyLibrary for Currency;

    // State and lifecycle events
    event StateChanged(LibAppStorage.BazaarState newState);
    event CircuitBreakerTriggered(bool paused);

    // Pool and liquidity events
    event PoolCreated(string indexed creatorId, bytes32 indexed poolId, uint24 feeTier, int24 tickSpacing, uint160 initialSqrtPriceX96);
    event LiquidityAdded(string indexed creatorId, address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(string indexed creatorId, address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event AutoLiquidityExecuted(string indexed creatorId, uint256 amount0, uint256 amount1, uint256 liquidity);
    
    // Pre-order events
    event PreOrderStarted(string indexed creatorId, uint256 startTime, uint256 floorPrice);
    event BidPlaced(string indexed creatorId, address indexed bidder, uint256 amount, LibAppStorage.BidType bidType, uint256 maxBid);
    event BidUpdated(string indexed creatorId, address indexed bidder, uint256 newAmount, LibAppStorage.BidType newBidType, uint256 newMaxBid);
    event TopBidsUpdated(string indexed creatorId, uint256 totalBids);
    event PreOrderFinalized(string indexed creatorId, uint256 finalPrice, uint256 numFinalized, uint256 creatorFee, uint256 steeloFee);
    event BidRefunded(string indexed creatorId, address indexed bidder, uint256 refundAmount);

    // Launch and anniversary events
    event LaunchStarted(string indexed creatorId, uint256 startTime);
    event LaunchMinted(string indexed creatorId, uint256 tokenId, uint256 price);
    event LaunchCompleted(string indexed creatorId, uint256 timestamp);
    event AnniversaryStarted(string indexed creatorId, uint256 startTime, uint256 tokenCount);
    event AnniversaryMinted(string indexed creatorId, address indexed buyer, uint256 tokenCount, uint256 price);
    event AnniversaryCompleted(string indexed creatorId, uint256 endTime, uint256 totalMinted);
    
    // Limit order events
    event LimitOrderCreated(string indexed creatorId, uint256 indexed orderId, address indexed trader, uint256 amount, uint256 price, bool isBuyOrder);
    event LimitOrderCancelled(string indexed creatorId, uint256 orderId);
    event AllLimitOrdersCancelled(string indexed creatorId);
    
    // Trading events
    event P2PTradeExecuted(string indexed creatorId, address indexed seller, address indexed buyer, uint256 price, uint256 amount);
    event P2PSwapExecuted(string indexed creatorId1, string indexed creatorId2, address indexed owner1, address indexed owner2, uint256 swapDifference);
    event ContentTraded(string indexed creatorId, string indexed contentId, address indexed seller, address buyer, uint256 price);
    event ContentAuctioned(string indexed creatorId, string indexed contentId, address indexed buyer, uint256 price);
    
    // Price and pool update events
    event PriceIncreased(string indexed creatorId, uint256 newPrice);
    event PriceUpdated(string indexed creatorId, uint256 newPrice);
    event VirtualPoolUpdated(string indexed creatorId, uint256 newSTZSupply, uint256 newSTLOBalance);
    event VirtualPoolInitialized(string indexed creatorId);
    event P2PTradesFrozen(string indexed creatorId, bool frozen);
    
    // Swap and fee events
    event TokenSwappedForSTLO(address indexed swapper, address indexed tokenIn, uint256 amountIn, uint256 amountSTLO);
    event STLOSwappedForToken(address indexed swapper, uint256 amountSTLO, address indexed tokenOut, uint256 amountOut);
    event SwapSkipped(uint256 index, string reason);
    event SwapFailed(uint256 index, string reason);
    event SwapExecuted(Currency currency0, Currency currency1, int256 amount0, int256 amount1, uint160 sqrtPriceX96, int24 tick, address sender);

    // Errors
    error InvalidState();
    error CircuitBreakerTriggered();
    error InvalidAddress();
    error PreOrderAlreadyStarted(string creatorId);
    error PreOrderPhaseEnded(string creatorId, uint256 endTime);
    error PreOrderAlreadyCompleted(string creatorId);
    error NoTokensLeftToMint(string creatorId);
    error MintPriceTooLow(string creatorId, uint256 price);
    error CreatorCannotPurchaseOwnTokens(string creatorId);
    error LaunchAlreadyStarted();
    error AnniversaryNotEligible(string creatorId);
    error AnniversaryTooSoon(string creatorId, uint256 nextEligibleTime);
    error AnniversaryInProgress(string creatorId);
    error AnniversaryNotStarted(string creatorId);
    error SwapFailed();
    error InsufficientTokenBalance();
    error InsufficientSTLOBalance();
    error InvalidAmount();
    error InvalidPrice();
    error InsufficientBalance();
    error InsufficientFunds();
    error OrderNotFound();
    error DailyTransactionLimitExceeded();
    error InvalidSqrtPriceLimit();
    error InvalidCreatorId();
    error InvalidMaxBid();
    error STLOTransferFailed();
    error InsufficientBids();
    error PreOrderPhaseNotEnded();

    /**
     * @dev Initializes the router with necessary addresses
     * @param _poolManager Address of the Uniswap V4 pool manager
     * @param _STLO Address of the STLO token
     * @param _paymentToken Address of the payment token (any ERC20)
     * @param _STZ Address of the STZ token
     */
    function initialize(address _poolManager, address _STLO, address _paymentToken, address _STZ) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (_poolManager == address(0) || _STLO == address(0) || _paymentToken == address(0) || _STZ == address(0)) revert InvalidAddress();
        if (s.bazaarState == LibAppStorage.BazaarState.Uninitialized) {
            s.bazaarState = LibAppStorage.BazaarState.Inactive;
        }
        s.poolManager = IPoolManager(_poolManager);
        s.steeloAddress = IERC20(_STLO);
        s.paymentToken = IERC20(_paymentToken);
        s.STZ = IERC20(_STZ);
    }

    /**
     * @dev Starts the PreOrder phase for a creator
     * @param steez The Steez struct
     */
    function startPreOrder(LibAppStorage.Steez storage steez) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezPreOrder storage preOrder = s.bazaarData.steezPreOrders[steez.creatorId];
        
        if (bytes(steez.creatorId).length == 0) revert InvalidCreatorId();
        if (s.bazaarState != LibAppStorage.BazaarState.Inactive) revert InvalidState();
        if (preOrder.startTime != 0) revert PreOrderAlreadyStarted(steez.creatorId);
        if (preOrder.isComplete) revert PreOrderAlreadyCompleted(steez.creatorId);

        preOrder.startTime = block.timestamp;
        preOrder.currentPrice = LibAppStorage.AppConstants.PRE_ORDER_INITIAL_PRICE;

        emit PreOrderStarted(steez.creatorId, preOrder.startTime, preOrder.currentPrice);

        setState(LibAppStorage.BazaarState.PreOrder);
    }

    /**
     * @dev Places a bid during the PreOrder phase
     * @param steez The Steez struct
     * @param amount The bid amount
     * @param bidType The type of bid (Normal, Higher, Auto)
     * @param maxBid The maximum bid amount for auto bids
     */
    function placeBid(LibAppStorage.Steez storage steez, uint256 amount, LibAppStorage.BidType bidType, uint256 maxBid) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezPreOrder storage preOrder = s.bazaarData.steezPreOrders[steez.creatorId];

        if (block.timestamp >= preOrder.endTime) revert PreOrderPhaseEnded(steez.creatorId, preOrder.endTime);
        if (preOrder.isComplete) revert PreOrderAlreadyCompleted(steez.creatorId);
        if (amount == 0) revert InvalidAmount();
        if (bidType == LibAppStorage.BidType.Auto && maxBid == 0) revert InvalidMaxBid();

        uint256 bidAmount = preOrder.currentPrice;
        preOrder.totalBids = preOrder.totalBids.add(1);

        // Lock the bid amount
        s.steeloAddress.safeTransferFrom(msg.sender, address(this), bidAmount);
        s.lockedBids[steez.creatorId][msg.sender] = s.lockedBids[steez.creatorId][msg.sender].add(bidAmount);

        updateTopBids(s, steez.creatorId, msg.sender, bidAmount, amount, bidType, maxBid);

        if (preOrder.topBids.length == LibAppStorage.AppConstants.PRE_ORDER_SUPPLY && preOrder.topBids[LibAppStorage.AppConstants.PRE_ORDER_SUPPLY - 1].price == preOrder.currentPrice) {
            preOrder.currentPrice = preOrder.currentPrice.add(LibAppStorage.AppConstants.PRE_ORDER_PRICE_INCREMENT);
            emit PriceIncreased(steez.creatorId, preOrder.currentPrice);
        }

        emit BidPlaced(steez.creatorId, msg.sender, bidAmount, bidType, maxBid);
    }

    /**
     * @dev Updates the top 250 bids for a creator
     * @param s The AppStorage struct
     * @param creatorId The ID of the creator
     * @param bidder The address of the bidder
     * @param bidAmount The bid amount
     * @param amount The token amount
     * @param bidType The type of bid (Normal, Higher, Auto)
     * @param maxBid The maximum bid amount for auto bids
     */
    function updateTopBids(
        LibAppStorage.AppStorage storage s,
        string calldata creatorId,
        address bidder,
        uint256 bidAmount,
        uint256 amount,
        LibAppStorage.BidType bidType,
        uint256 maxBid
    ) private {
        if (bidAmount == 0) revert InvalidAmount();
        if (amount == 0) revert InvalidAmount();
        if (bidder == address(0)) revert InvalidAddress();

        LibAppStorage.SteezPreOrder storage preOrder = s.bazaarData.steezPreOrders[creatorId];
        LibAppStorage.Bid[] memory bids = preOrder.topBids;
        uint256 bidsLength = bids.length;

        LibAppStorage.Bid memory newBid = LibAppStorage.Bid({
            price: bidAmount,
            amount: amount,
            bidder: bidder,
            bidType: bidType,
            maxBid: maxBid,
            timestamp: block.timestamp
        });

        uint256 insertIndex = findInsertIndex(bids, newBid);

        if (insertIndex < LibAppStorage.AppConstants.PRE_ORDER_SUPPLY) {
            // Insert the new bid
            for (uint256 i = LibAppStorage.AppConstants.PRE_ORDER_SUPPLY - 1; i > insertIndex; --i) {
                if (i > 0) {
                    bids[i] = bids[i - 1];
                }
            }
            bids[insertIndex] = newBid;

            // Adjust auto-bids
            uint256 autoBidAdjustmentLimit = 5; // Limit the number of auto-bid adjustments
            for (uint256 i = 0; i < LibAppStorage.AppConstants.PRE_ORDER_SUPPLY && autoBidAdjustmentLimit > 0; ++i) {
                LibAppStorage.Bid memory currentBid = bids[i];
                if (currentBid.bidType == LibAppStorage.BidType.Auto && currentBid.maxBid > currentBid.price) {
                    uint256 newBidAmount = currentBid.maxBid < preOrder.currentPrice ? currentBid.maxBid : preOrder.currentPrice;
                    if (newBidAmount > currentBid.price) {
                        // Lock additional funds for the auto-bid increase
                        uint256 additionalLock = newBidAmount.sub(currentBid.price);
                        s.paymentToken.safeTransferFrom(currentBid.bidder, address(this), additionalLock);
                        s.lockedBids[creatorId][currentBid.bidder] = s.lockedBids[creatorId][currentBid.bidder].add(additionalLock);

                        bids[i].price = newBidAmount;
                        insertIndex = findInsertIndex(bids, bids[i]);
                        if (insertIndex != i) {
                            LibAppStorage.Bid memory tempBid = bids[i];
                            for (uint256 j = i; j > insertIndex; --j) {
                                if (j > 0) {
                                    bids[j] = bids[j - 1];
                                }
                            }
                            bids[insertIndex] = tempBid;
                        }
                        emit BidUpdated(creatorId, currentBid.bidder, newBidAmount, LibAppStorage.BidType.Auto, currentBid.maxBid);
                        --autoBidAdjustmentLimit;
                    }
                }
            }
        }

        // Update storage
        preOrder.topBids = bids;

        // Refund outbid participants
        for (uint256 i = LibAppStorage.AppConstants.PRE_ORDER_SUPPLY; i < bidsLength; ++i) {
            address outbidBidder = bids[i].bidder;
            uint256 refundAmount = s.lockedBids[creatorId][outbidBidder];
            if (refundAmount > 0) {
                s.lockedBids[creatorId][outbidBidder] = 0;
                s.steeloAddress.safeTransferFrom(address(this), outbidBidder, refundAmount);
                emit BidRefunded(creatorId, outbidBidder, refundAmount);
            }
        }

        emit TopBidsUpdated(creatorId, bids.length);
    }

    /**
     * @dev Finds the insert index for a new bid in a sorted array of bids
     * @param bids The array of bids
     * @param newBid The new bid to insert
     * @return The index where the new bid should be inserted
     */
    function findInsertIndex(LibAppStorage.Bid[] memory bids, LibAppStorage.Bid memory newBid) private pure returns (uint256) {
        uint256 left = 0;
        uint256 right = bids.length;

        while (left < right) {
            uint256 mid = left + (right - left) / 2;
            if (bids[mid].price < newBid.price || (bids[mid].price == newBid.price && bids[mid].timestamp > newBid.timestamp)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    /**
     * @dev Mints tokens for successful PreOrder bids
     * @param steez The Steez struct
     */
    function finalizeBids(LibAppStorage.Steez storage steez) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezPreOrder storage preOrder = s.bazaarData.steezPreOrders[steez.creatorId];
        
        if (preOrder.totalBids < LibAppStorage.AppConstants.PRE_ORDER_SUPPLY) revert InsufficientBids();
        if (block.timestamp < preOrder.endTime) revert PreOrderPhaseNotEnded();
        if (preOrder.isComplete) revert PreOrderAlreadyCompleted(steez.creatorId);

        LibSteez.createSteez(s.steez[creatorId].creatorAddress, steez.creatorId, "Steez Name", "STZ");
        s.creatorMembers[steez.creatorAddress] = true;
        
        uint256 supplyCount = LibAppStorage.AppConstants.PRE_ORDER_SUPPLY;
        uint256 totalSaleAmount = 0;
        uint256 numFinalized = preOrder.topBids.length;

        for (uint256 i = 0; i < supplyCount; ++i) {
            address bidder = preOrder.topBids[i].bidder;
            uint256 bidAmount = preOrder.topBids[i].price;
            
            // Transfer locked funds to the contract
            s.lockedBids[steez.creatorId][bidder] = s.lockedBids[steez.creatorId][bidder].sub(bidAmount);
            totalSaleAmount = totalSaleAmount.add(bidAmount);
            
            LibSteez.mintLaunch(steez.creatorId, bidder, 1);
            LibAppStorage.setPreOrderFinalizedBid(s, steez.creatorId, bidder, true);

            LibAppStorage.BazaarState state = LibAppStorage.BazaarState.Launch;

            if (address(s.hooks) != address(0)) {
                IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                    zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                    amountSpecified: int256(bidAmount),
                    sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
                });
                IPoolManager.SwapParams(bidder, steez.creatorId, params, BalanceDelta(int256(bidAmount), 0));
            }
        }

        preOrder.isComplete = true;

        uint256 averageSalePrice = totalSaleAmount / numFinalized;

        emit PreOrderFinalized(steez.creatorId, averageSalePrice, numFinalized, creatorFee, steeloFee);

        // Initialize the pool after successful pre-order
        initializeSteezPool(steez.creatorId);
        emit VirtualPoolInitialized(steez.creatorId);

        startLaunch(steez);
    }

    /**
    * @notice Initializes a new Uniswap v4 pool for a Steez token
    * @param creatorId The ID of the creator
    * @return poolId The ID of the newly created pool
    */
    function initializeSteezPool(string memory creatorId) internal  returns (bytes32 poolId) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        // Ensure the creator exists
        LibAppStorage.Creator storage creator = LibAppStorage.getCreator(s, creatorId);
        require(creator.creatorExists, "Creator does not exist");

        // Get the Steez token address
        address steez = LibSteez.getSteezAddress(creatorId);
        require(steez != address(0), "Steez token not found");

        // Use default values for fee tier and tick spacing
        uint24 feeTier = 3000; // 0.3%
        int24 tickSpacing = 60;

        // Create the PoolKey
        PoolKey memory key = PoolKey({
            currency0: CurrencyLibrary.wrap(address(s.steeloAddress)),
            currency1: CurrencyLibrary.wrap(steez),
            fee: feeTier,
            tickSpacing: tickSpacing,
            hooks: s.hooks
        });

        // Calculate the initial tick based on the price ratio
        uint256 averageSalePrice = s.bazaarData.steezPreOrders[creatorId].currentPrice;
        int24 initialTick = TickMath.getTickAtSqrtRatio(uint160(averageSalePrice));

        // Get the sqrt price at the tick
        uint160 initialSqrtPriceX96 = TickMath.getSqrtRatioAtTick(initialTick);

        // Initialize the pool
        try s.poolManager.initialize(key, initialSqrtPriceX96) {
            poolId = PoolIdLibrary.toId(key);
            
            // Store pool information
            s.pools[poolId] = LibAppStorage.UniswapV4Pool({
                poolAddress: address(s.poolManager),
                fee: feeTier,
                tickSpacing: tickSpacing,
                sqrtPriceX96: initialSqrtPriceX96,
                tick: initialTick,
                liquidity: 0
            });

            emit PoolCreated(creatorId, poolId, feeTier, tickSpacing, initialSqrtPriceX96);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Pool initialization failed: ", reason)));
        }

        setP2PTradesFrozen(creatorId, true); // Unlocked upon successful launch completion
        return poolId;
    }

    /**
     * @dev Starts the Launch phase for a creator
     * @param steez The Steez struct
     */
    function startLaunch(LibAppStorage.Steez storage steez) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.bazaarState != LibAppStorage.BazaarState.PreOrder) revert InvalidState();
        
        LibAppStorage.SteezLaunch storage launch = s.bazaarData.steezLaunches[steez.creatorId];
        if (launch.startTime != 0) revert LaunchAlreadyStarted();

        launch.startTime = block.timestamp;
        launch.currentPrice = s.bazaarData.steezPreOrders[steez.creatorId].currentPrice;
        launch.tokenCount = LibAppStorage.AppConstants.TOKENS_AFTER_PREORDER;
        launch.lastSaleTime = block.timestamp;

        LibSteez.mintLaunch(steez.creatorId, address(this), LibAppStorage.AppConstants.TOKENS_AFTER_PREORDER);

        emit LaunchStarted(steez.creatorId, block.timestamp);

        setState(s, LibAppStorage.BazaarState.Launch);
    }
    
    /**
     * @dev Mints a token during the Launch phase
     * @param steez The Steez struct
     * @param buyer The address of the buyer
     */
    function mintLaunch(LibAppStorage.Steez storage steez, address buyer) internal  {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.bazaarState != LibAppStorage.BazaarState.Launch) revert InvalidState();
        
        LibAppStorage.SteezLaunch storage launch = s.bazaarData.steezLaunches[steez.creatorId];
        if (launch.tokenCount == 0) revert NoTokensLeftToMint(steez.creatorId);
        
        uint256 mintPrice = calculateLaunchPrice(launch);
        if (mintPrice == 0) revert MintPriceTooLow(steez.creatorId, mintPrice);

        if (!s.steeloAddress.safeTransferFrom(buyer, address(this), mintPrice)) revert STLOTransferFailed();

        // Check daily volume
        uint256 today = block.timestamp / 1 days;
        s.dailyVolume[today] += mintPrice;
        if (s.dailyVolume[today] > LibAppStorage.AppConstants.MAX_DAILY_VOLUME) revert DailyVolumeLimitExceeded();

        launch.tokenCount = launch.tokenCount.sub(1);
        launch.lastSaleTime = block.timestamp;
        launch.totalSales = launch.totalSales.add(mintPrice);
        launch.currentPrice = mintPrice;

        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.Launch;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(mintPrice),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, steez.creatorId, params, BalanceDelta(int256(mintPrice), 0));
        }

        if (!s.steeloAddress.transferToken(steez.creatorId, address(this), buyer, 1)) revert TokenTransferFailed();

        emit LaunchMinted(steez.creatorId, launch.tokenCount, mintPrice);

        if (launch.tokenCount == 0) {
            finalizeLaunch(steez);
            emit LaunchCompleted(steez.creatorId, block.timestamp);
        }
    }

    /**
     * @dev Calculates the launch price
     * @param launch The SteezLaunch struct
     * @return The calculated launch price
     */
    function calculateLaunchPrice(LibAppStorage.SteezLaunch storage launch) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        uint256 timeElapsed = block.timestamp.sub(launch.lastSaleTime);
        
        if (timeElapsed <= LibAppStorage.AppConstants.LAUNCH_PRICE_INCREASE_DURATION) {
            return launch.currentPrice.add(
                launch.currentPrice.mul(LibAppStorage.AppConstants.LAUNCH_INITIAL_PRICE_INCREASE).div(LibAppStorage.AppConstants.PRICE_PRECISION)
            );
        } else if (timeElapsed <= LibAppStorage.AppConstants.LAUNCH_PRICE_RESET_DURATION) {
            uint256 decreaseDuration = timeElapsed.sub(LibAppStorage.AppConstants.LAUNCH_PRICE_INCREASE_DURATION);
            uint256 decreasePercentage = LibAppStorage.AppConstants.LAUNCH_INITIAL_PRICE_INCREASE.mul(
                LibAppStorage.AppConstants.LAUNCH_PRICE_DECREASE_DURATION.sub(decreaseDuration)
            ).div(LibAppStorage.AppConstants.LAUNCH_PRICE_DECREASE_DURATION);
            return launch.currentPrice.add(
                launch.currentPrice.mul(decreasePercentage).div(LibAppStorage.AppConstants.PRICE_PRECISION)
            );
        } else {
            return launch.currentPrice;
        }
    }

    /**
     * @dev Finalizes the Launch phase by distributing remaining tokens and fees
     * @param steez The Steez struct
     */
    function finalizeLaunch(LibAppStorage.Steez storage steez) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezLaunch storage launch = s.bazaarData.steezLaunches[steez.creatorId];

        require(launch.tokenCount == 0, "Launch minting not complete");

        initializeSteezPool(steez.creatorId);
        setState(s, LibAppStorage.BazaarState.P2P);

        emit LaunchMintingCompleted(steez.creatorId);
        setP2PTradesFrozen(steez.creatorId, false);
    }

   /**
     * @dev Starts the Anniversary phase for a creator
     * @param steez The Steez struct
     */
    function startAnniversary(LibAppStorage.Steez storage steez) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezAnniversary storage anniversary = s.bazaarData.steezAnniversaries[steez.creatorId];
        
        if (anniversary.isInProgress) revert AnniversaryInProgress(steez.creatorId);
        
        uint256 nextEligibleTime = anniversary.lastCompletionTime + 365 days;
        if (block.timestamp < nextEligibleTime) revert AnniversaryTooSoon(steez.creatorId, nextEligibleTime);
        
        if (!isEligibleForAnniversary(steez.creatorId)) revert AnniversaryNotEligible(steez.creatorId);

        cancelAllActiveLimitOrders(steez.creatorId);

        setP2PTradesFrozen(steez.creatorId, true);

        anniversary.startTime = block.timestamp;
        anniversary.currentPrice = calculateInitialAnniversaryPrice(steez.creatorId);
        anniversary.tokenCount = LibAppStorage.AppConstants.ANNIVERSARY_TOKEN_COUNT;
        anniversary.lastSaleTime = block.timestamp;
        anniversary.isInProgress = true;

        if (!LibSteez.mintLaunch(steez.creatorId, address(this), LibAppStorage.AppConstants.ANNIVERSARY_TOKEN_COUNT)) revert TokenMintFailed();

        emit AnniversaryStarted(steez.creatorId, block.timestamp, LibAppStorage.AppConstants.ANNIVERSARY_TOKEN_COUNT);

        setState(s, LibAppStorage.BazaarState.Anniversary);
    }

    /**
     * @dev Mints a token during the Anniversary phase
     * @param steez The Steez struct
     * @param buyer The address of the buyer
     */
    function mintAnniversary(LibAppStorage.Steez storage steez, address buyer) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.SteezAnniversary storage anniversary = s.bazaarData.steezAnniversaries[steez.creatorId];
        
        if (!anniversary.isInProgress) revert AnniversaryNotStarted(steez.creatorId);
        if (anniversary.tokenCount == 0) revert NoTokensLeftToMint(steez.creatorId);

        ensureNotCreator(steez.creatorId, buyer);

        uint256 mintPrice = calculateAnniversaryPrice(anniversary);
        if (mintPrice == 0) revert MintPriceTooLow(steez.creatorId, mintPrice);

        if (!s.steeloAddress.safeTransferFrom(buyer, address(this), mintPrice)) revert STLOTransferFailed();

        anniversary.tokenCount--;
        anniversary.lastSaleTime = block.timestamp;
        anniversary.totalSales += mintPrice;
        anniversary.currentPrice = mintPrice;

        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.Anniversary;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(mintPrice),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, steez.creatorId, params, BalanceDelta(int256(mintPrice), 0));
        }

        if (!s.steeloAddress.transferToken(steez.creatorId, address(this), buyer, 1)) revert TokenTransferFailed();

        emit AnniversaryMinted(steez.creatorId, buyer, anniversary.tokenCount, mintPrice);

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        s.bazaarData.dailyVolume[today] += mintPrice;

        if (anniversary.tokenCount == 0) {
            completeAnniversary(steez.creatorId);
        }
    }

    /**
    * @dev Calculates the initial price for the Anniversary phase
    * @param creatorId The ID of the creator
    * @return The initial anniversary price
    */
    function calculateInitialAnniversaryPrice(string memory creatorId) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        return s.steez[creatorId].currentPrice;
    }

    /**
     * @dev Calculates the current price during the Anniversary phase
     * @param anniversary The SteezAnniversary struct
     * @return The calculated anniversary price
     */
    function calculateAnniversaryPrice(LibAppStorage.SteezAnniversary storage anniversary) internal view returns (uint256) {
        if (anniversary.startTime == 0) revert AnniversaryNotInitialized();
        uint256 timeElapsed = block.timestamp - anniversary.lastSaleTime;
        
        if (timeElapsed > LibAppStorage.AppConstants.ANNIVERSARY_PRICE_INCREASE_DURATION) {
            return anniversary.currentPrice;
        }
        
        uint256 priceIncrease = anniversary.currentPrice * LibAppStorage.AppConstants.ANNIVERSARY_PRICE_INCREASE_FACTOR * timeElapsed;
        priceIncrease /= LibAppStorage.AppConstants.ANNIVERSARY_PRICE_INCREASE_DURATION;
        
        if (LibAppStorage.AppConstants.PRICE_PRECISION != 1) {
            priceIncrease /= LibAppStorage.AppConstants.PRICE_PRECISION;
        }
        
        return anniversary.currentPrice + priceIncrease;
    }

    /**
     * @dev Checks if a creator is eligible for an Anniversary
     * @param creatorId The ID of the creator
     * @return bool True if eligible, false otherwise
     */
    function isEligibleForAnniversary(string memory creatorId) internal view returns (bool) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        uint256 maxSupply = LibAppStorage.getLaunchTokenCount(s, creatorId) + LibAppStorage.AppConstants.ANNIVERSARY_TOKEN_COUNT;
        uint256 transactionCount = LibAppStorage.getSteezTransactionCount(s, creatorId);
        return transactionCount >= 2 * maxSupply;
    }

    /**
     * @dev Completes the Anniversary phase
     * @param creatorId The ID of the creator
     */
    function completeAnniversary(string memory creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.SteezAnniversary storage anniversary = s.bazaarData.steezAnniversaries[creatorId];
        if (!anniversary.isInProgress) revert AnniversaryNotStarted(creatorId);
        if (anniversary.tokenCount > 0) revert AnniversaryNotCompleted(creatorId);

        anniversary.isInProgress = false;
        anniversary.lastCompletionTime = block.timestamp;

        setP2PTradesFrozen(creatorId, false);

        setState(s, LibAppStorage.BazaarState.P2P);
        
        emit AnniversaryCompleted(creatorId, block.timestamp, LibAppStorage.AppConstants.ANNIVERSARY_TOKEN_COUNT);
    }

    /**
    * @dev Sets the P2P trades of a Steez to be frozen or unfrozen
    * @param creatorId The ID of the creator
    * @param frozen Whether the P2P trades of the Steez should be frozen
    */
    function setP2PTradesFrozen(string memory creatorId, bool frozen) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        s.bazaarData.steezOrderBooksFrozen[creatorId] = frozen;
        emit P2PTradesFrozen(creatorId, frozen);
    }

    /**
     * @dev Creates a limit order for a Steez
     * @param creatorId The ID of the creator
     * @param amount The amount of Steez to be traded
     * @param price The price of the Steez
     * @param isBuyOrder Whether the order is a buy or sell
     * @return The ID of the created order
     */
    function createLimitOrder(string memory creatorId, uint256 amount, uint256 price, bool isBuyOrder) internal returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        if (amount == 0) revert InvalidAmount();
        if (price == 0) revert InvalidPrice();
        
        if (!isBuyOrder) {
            if (s.steezInvested[msg.sender][creatorId] < amount) revert InsufficientBalance();
        } else {
            if (s.balances[msg.sender] < amount * price) revert InsufficientFunds();
        }

        uint256 orderId = s.bazaarData.nextOrderId++;
        LibAppStorage.LimitOrder memory newOrder = LibAppStorage.LimitOrder({
            orderId: orderId,
            seller: msg.sender,
            price: price,
            amount: amount,
            isBuyOrder: isBuyOrder,
            timestamp: block.timestamp
        });

        s.bazaarData.activeLimitOrders[creatorId].push(newOrder);
        emit LimitOrderCreated(creatorId, orderId, msg.sender, amount, price, isBuyOrder);

        return orderId;
    }
    
    /**
     * @dev Updates a limit order
     * @param creatorId The ID of the creator
     * @param orderId The ID of the order to update
     * @param newAmount The new amount of Steez to be traded
     * @param newPrice The new price of the Steez
     */
    function updateLimitOrder(string memory creatorId, uint256 orderId, uint256 newAmount, uint256 newPrice) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        
        LibAppStorage.LimitOrder[] storage orders = s.bazaarData.activeLimitOrders[creatorId];
        bool orderFound = false;
        uint256 ordersLength = orders.length;
        for (uint256 i = 0; i < ordersLength; ++i) {
            if (orders[i].orderId == orderId && orders[i].seller == msg.sender) {
                if (newAmount > 0) orders[i].amount = newAmount;
                if (newPrice > 0) orders[i].price = newPrice;
                orderFound = true;
                emit LimitOrderUpdated(creatorId, orderId, newAmount, newPrice);
                break;
            }
        }
        if (!orderFound) revert OrderNotFound();
    }

    /**
     * @dev Cancels a limit order
     * @param creatorId The ID of the creator
     * @param orderId The ID of the order to cancel
     */
    function cancelLimitOrder(string memory creatorId, uint256 orderId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.LimitOrder[] storage orders = s.bazaarData.activeLimitOrders[creatorId];
        bool orderFound = false;
        uint256 ordersLength = orders.length;
        for (uint256 i = 0; i < ordersLength; ++i) {
            if (orders[i].orderId == orderId && orders[i].seller == msg.sender) {
                orders[i] = orders[ordersLength - 1];
                orders.pop();
                orderFound = true;
                emit LimitOrderCancelled(creatorId, orderId);
                break;
            }
        }
        if (!orderFound) revert OrderNotFound();
    }

    /**
     * @dev Matches limit orders for a Steez
     * @param creatorId The ID of the creator
     */
    function matchOrders(string memory creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.LimitOrder[] storage buyOrders = s.bazaarData.activeLimitOrders[creatorId];
        LibAppStorage.LimitOrder[] storage sellOrders = s.bazaarData.activeLimitOrders[creatorId];
        
        sortOrders(buyOrders, true);
        sortOrders(sellOrders, false);
        
        uint256 i = 0;
        uint256 j = 0;
        uint256 buyOrdersLength = buyOrders.length;
        uint256 sellOrdersLength = sellOrders.length;
        
        while (i < buyOrdersLength && j < sellOrdersLength) {
            LibAppStorage.LimitOrder storage buyOrder = buyOrders[i];
            LibAppStorage.LimitOrder storage sellOrder = sellOrders[j];
            
            if (buyOrder.price >= sellOrder.price) {
                uint256 matchedAmount = getMinimum(buyOrder.amount, sellOrder.amount);
                uint256 executionPrice = (buyOrder.price + sellOrder.price) / 2;
                
                executeTrade(creatorId, buyOrder.seller, sellOrder.seller, matchedAmount, executionPrice);
                
                buyOrder.amount -= matchedAmount;
                sellOrder.amount -= matchedAmount;
                
                if (buyOrder.amount == 0) ++i;
                if (sellOrder.amount == 0) ++j;
            } else {
                break;
            }
        }
        
        removeExecutedOrders(buyOrders);
        removeExecutedOrders(sellOrders);
    }

    /**
     * @dev Removes executed orders from the active limit orders list
     * @param orders The array of active limit orders
     */
    function removeExecutedOrders(LibAppStorage.LimitOrder[] storage orders) internal {
        uint256 i = 0;
        uint256 ordersLength = orders.length;
        while (i < ordersLength) {
            if (orders[i].amount == 0) {
                removeOrder(orders, i);
                --ordersLength;
            } else {
                ++i;
            }
        }
    }

    /**
     * @dev Removes an order from the active limit orders list
     * @param orders The array of active limit orders
     * @param index The index of the order to remove
     */
    function removeOrder(LibAppStorage.LimitOrder[] storage orders, uint index) internal {
        if (index >= orders.length) revert InvalidOrderIndex();
        orders[index] = orders[orders.length - 1];
        orders.pop();
    }

    /**
     * @dev Gets the highest buy order price from the order book
     * @param creatorId The ID of the creator
     * @return The highest buy order price, or 0 if no buy orders exist
     */
    function getOrderBookPrice(string memory creatorId) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.LimitOrder[] storage buyOrders = s.bazaarData.activeLimitOrders[creatorId];
        
        if (buyOrders.length == 0) return 0;
        
        // Return the highest buy order price
        return buyOrders[0].price;
    }

    /**
     * @dev Updates the virtual liquidity pool for price calculation
     * @param creatorId The ID of the creator
     * @param stzAmount The amount of STZ to be traded
     * @param stloAmount The amount of STLO to be traded
     * @param isBuy Whether the trade is a buy or sell
     */
    function updateVirtualPool(string memory creatorId, uint256 stzAmount, uint256 stloAmount, bool isBuy) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.VirtualLiquidityPool storage pool = s.bazaarData.virtualPools[creatorId];
        
        if (isBuy) {
            pool.virtualSTZSupply += stzAmount;
            pool.virtualSTLOBalance += stloAmount;
        } else {
            if (pool.virtualSTZSupply < stzAmount) revert InsufficientVirtualSTZ();
            if (pool.virtualSTLOBalance < stloAmount) revert InsufficientVirtualSTLO();
            pool.virtualSTZSupply -= stzAmount;
            pool.virtualSTLOBalance -= stloAmount;
        }
        
        pool.k = pool.virtualSTZSupply * pool.virtualSTLOBalance;

        emit VirtualPoolUpdated(creatorId, pool.virtualSTZSupply, pool.virtualSTLOBalance);
    }

    /**
     * @dev Executes a Steez-for-Steez swap
     * @param steez1 The Steez struct for the first Steez
     * @param steez2 The Steez struct for the second Steez
     * @param steez1Quantity The quantity of the first Steez to swap
     * @param steez2Quantity The quantity of the second Steez to swap
     * @param owner1 The address of the owner of the first Steez
     * @param owner2 The address of the owner of the second Steez
     */
    function executeSteezForSteez(
        LibAppStorage.Steez storage steez1,
        LibAppStorage.Steez storage steez2,
        uint256 steez1Quantity,
        uint256 steez2Quantity,
        address owner1,
        address owner2
    ) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        if (s.steezInvested[owner1][steez1.creatorId] < steez1Quantity) revert InsufficientSteez1Balance();
        if (s.steezInvested[owner2][steez2.creatorId] < steez2Quantity) revert InsufficientSteez2Balance();
        if (owner1 == owner2) revert SameOwnerSwap();

        uint256 steez1Price = s.steez[steez1.creatorId].currentPrice;
        uint256 steez2Price = s.steez[steez2.creatorId].currentPrice;
        uint256 steez1Value = steez1Price * steez1Quantity;
        uint256 steez2Value = steez2Price * steez2Quantity;
        
        int256 swapDifference = int256(steez1Value) - int256(steez2Value);
        address payer = swapDifference > 0 ? owner2 : owner1;
        address receiver = swapDifference > 0 ? owner1 : owner2;
        uint256 paymentAmount = uint256(swapDifference > 0 ? swapDifference : -swapDifference);

        if (s.balances[payer] < paymentAmount) revert InsufficientSTLOBalance();

        // Prepare swap parameters
        LibAppStorage.SwapRequest[] memory requests = new LibAppStorage.SwapRequest[](2);
        requests[0] = LibAppStorage.SwapRequest({
            creatorId: steez1.creatorId,
            amount: steez1Quantity,
            isBuy: false
        });
        requests[1] = LibAppStorage.SwapRequest({
            creatorId: steez2.creatorId,
            amount: steez2Quantity,
            isBuy: true
        });

        // Execute multi-swap
        LibAppStorage.SwapResult[] memory results = multiPoolSwap(requests);

        // Handle additional payment
        if (paymentAmount > 0) {
            s.balances[payer] -= paymentAmount;
            s.balances[receiver] += paymentAmount;
        }

        // Update Steez balances
        s.steezInvested[owner1][steez1.creatorId] -= results[0].amountFilled;
        s.steezInvested[owner2][steez1.creatorId] += results[0].amountFilled;
        s.steezInvested[owner2][steez2.creatorId] -= results[1].amountFilled;
        s.steezInvested[owner1][steez2.creatorId] += results[1].amountFilled;

        emit P2PSwapExecuted(steez1.creatorId, steez2.creatorId, owner1, owner2, paymentAmount);

        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.SteezForSteez;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params1 = IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: int256(steez1Value),
                sqrtPriceLimitX96: 0
            });
            IPoolManager.SwapParams(msg.sender, steez1.creatorId, params1, BalanceDelta(int256(steez1Value), 0));

            IPoolManager.SwapParams memory params2 = IPoolManager.SwapParams({
                zeroForOne: true,
                amountSpecified: int256(steez2Value),
                sqrtPriceLimitX96: 0
            });
            IPoolManager.SwapParams(msg.sender, steez2.creatorId, params2, BalanceDelta(int256(steez2Value), 0));
        }
    }

    /**
     * @dev Executes a content trade
     * @param content The content to be traded
     * @param seller The address of the seller
     * @param buyer The address of the buyer
     * @param price The price of the content
     */
    function executeContentTrade(LibAppStorage.Content calldata content, address seller, address buyer, uint256 price) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        if (s.creatorContent[content.creatorId][content.contentId].creatorAddress != seller) revert SellerDoesNotOwnContent();
        
        // Transfer STLO tokens from buyer to seller
        if (!s.steeloAddress.safeTransferFrom(buyer, seller, price)) revert STLOTransferFailed();

        // Transfer content ownership
        s.creatorContent[content.creatorId][content.contentId].creatorAddress = buyer;

        emit ContentTraded(content.creatorId, content.contentId, seller, buyer, price);
        
        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.ContentTrade;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(price),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, content.creatorId, params, BalanceDelta(int256(price), 0));
        }
    }

    /**
     * @dev Swaps STLO for another token
     * @param swapper The address of the account swapping tokens
     * @param amountSTLO The amount of STLO to swap
     * @param tokenOut The address of the token to receive
     * @param minAmountOut The minimum amount of tokenOut to receive
     * @return amountOut The amount of tokenOut received
     */
    function swapSTLOForToken(address swapper, uint256 amountSTLO, address tokenOut, uint256 minAmountOut) internal returns (uint256 amountOut) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();
        if (swapper == address(0)) revert InvalidSwapperAddress();
        if (tokenOut == address(0)) revert InvalidTokenAddress();
        if (amountSTLO == 0) revert InvalidSwapAmount();

        IERC20 STLO = IERC20(s.steeloAddress);
        
        STLO.safeTransferFrom(swapper, address(this), amountSTLO);
        if (STLO.balanceOf(address(this)) < amountSTLO) revert InsufficientSTLOBalance();

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(STLO)),
            currency1: Currency.wrap(tokenOut),
            fee: LibAppStorage.AppConstants.SWAP_FEE,
            tickSpacing: LibAppStorage.AppConstants.TICK_SPACING,
            hooks: s.hooks
        });

        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: int256(amountSTLO),
            sqrtPriceLimitX96: 0
        });

        BalanceDelta delta = swap(key, params);
        amountOut = uint256(-delta.amount1());
        if (amountOut < minAmountOut) revert InsufficientOutputAmount();

        IERC20(tokenOut).safeTransfer(swapper, amountOut);

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        s.dailyVolume[today] += amountSTLO;

        emit STLOSwappedForToken(swapper, amountSTLO, tokenOut, amountOut);
        return amountOut;
    }

    /**
     * @dev Swaps a token for STLO
     * @param swapper The address of the account swapping tokens
     * @param tokenIn The address of the token to swap
     * @param amountIn The amount of tokenIn to swap
     * @param minAmountSTLO The minimum amount of STLO to receive
     * @return amountSTLO The amount of STLO received
     */
    function swapTokenForSTLO(address swapper, address tokenIn, uint256 amountIn, uint256 minAmountSTLO) internal returns (uint256 amountSTLO) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();
        if (swapper == address(0)) revert InvalidSwapperAddress();
        if (tokenIn == address(0)) revert InvalidTokenAddress();
        if (amountIn == 0) revert InvalidSwapAmount();

        IERC20 STLO = IERC20(s.steeloAddress);
        IERC20 token = IERC20(tokenIn);

        IERC20(tokenIn).safeTransferFrom(swapper, address(this), amountIn);
        if (token.balanceOf(address(this)) < amountIn) revert InsufficientTokenBalance();

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(tokenIn),
            currency1: Currency.wrap(address(STLO)),
            fee: LibAppStorage.AppConstants.SWAP_FEE,
            tickSpacing: LibAppStorage.AppConstants.TICK_SPACING,
            hooks: s.hooks
        });

        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: false,
            amountSpecified: int256(amountIn),
            sqrtPriceLimitX96: 0
        });

        BalanceDelta delta = swap(key, params);
        amountSTLO = uint256(-delta.amount0());
        if (amountSTLO < minAmountSTLO) revert InsufficientOutputAmount();

        if (!IERC20(address(STLO)).safeTransfer(swapper, amountSTLO)) revert STLOTransferFailed();

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        s.dailyVolume[today] += amountIn;

        emit STLOSwappedForToken(swapper, amountIn, address(STLO), amountSTLO);
        return amountSTLO;
    }

    /**
     * @dev Calculates the price of a Steez based on the virtual liquidity pool and order book
     * @param creatorId The ID of the creator
     * @return The calculated price of the Steez
     */
    function calculatePrice(string memory creatorId) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.VirtualLiquidityPool storage pool = s.bazaarData.virtualPools[creatorId];
        
        uint256 supply = pool.virtualSTZSupply;
        uint256 balance = pool.virtualSTLOBalance;
        
        // Use a combination of constant product and exponential curve
        uint256 basePrice = (balance * LibAppStorage.AppConstants.PRICE_MULTIPLIER) / supply;
        uint256 exponentialFactor = (supply * supply) / (LibAppStorage.AppConstants.PRICE_DIVIDER * LibAppStorage.AppConstants.PRICE_DIVIDER);
        
        uint256 orderBookPrice = getOrderBookPrice(creatorId);
        uint256 virtualPoolPrice = (basePrice * (LibAppStorage.AppConstants.PRICE_DIVIDER + exponentialFactor)) / LibAppStorage.AppConstants.PRICE_DIVIDER;
        
        // Combine virtual pool price with order book price
        return (virtualPoolPrice + orderBookPrice) / 2;
    }

    /**
     * @dev Gets the highest buy order price from the order book
     * @param creatorId The ID of the creator
     * @return The highest buy order price, or 0 if no buy orders exist
     */
    function getOrderBookPrice(string memory creatorId) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.LimitOrder[] storage buyOrders = s.bazaarData.activeLimitOrders[creatorId];
        
        if (buyOrders.length == 0) return 0;
        
        // Return the highest buy order price
        return buyOrders[0].price;
    }

    /**
     * @dev Updates the actual price and liquidity of a Steez based on a trade
     * @param creatorId The ID of the creator
     * @param amount The amount of Steez traded
     * @param isBuy Whether the trade is a buy or sell
     */
    function updatePrice(string memory creatorId, uint256 amount, bool isBuy) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.Steez storage steez = s.steez[creatorId];
        
        uint256 currentPrice = calculatePrice(creatorId);
        uint256 tradeValue = amount * currentPrice;

        if (isBuy) {
            steez.totalSupply += amount;
            steez.liquidityPool += tradeValue;
        } else {
            if (steez.totalSupply < amount) revert InsufficientSupply();
            steez.totalSupply -= amount;
            steez.liquidityPool -= tradeValue;
        }
        
        steez.currentPrice = currentPrice;
        steez.oldPrice = steez.currentPrice;
        steez.steezPriceFluctuation = int256(currentPrice) - int256(steez.oldPrice);
    }

    /**
     * @dev Updates the virtual liquidity pool for price calculation
     * @param creatorId The ID of the creator
     * @param stzAmount The amount of STZ to be traded
     * @param stloAmount The amount of STLO to be traded
     * @param isBuy Whether the trade is a buy or sell
     */
    function updateVirtualPool(string memory creatorId, uint256 stzAmount, uint256 stloAmount, bool isBuy) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        
        // Ensure the virtual pool exists for the creator
        if (s.virtualPool.virtualSTZSupply == 0 && s.virtualPool.virtualSTLOBalance == 0) {
            // Initialize the pool if it doesn't exist
            s.virtualPool.virtualSTZSupply = LibAppStorage.AppConstants.INITIAL_PRICE;
            s.virtualPool.virtualSTLOBalance = LibAppStorage.AppConstants.INITIAL_PRICE;
        }
        
        if (isBuy) {
            s.virtualPool.virtualSTZSupply += stzAmount;
            s.virtualPool.virtualSTLOBalance += stloAmount;
        } else {
            if (s.virtualPool.virtualSTZSupply < stzAmount) revert InsufficientVirtualSTZ();
            if (s.virtualPool.virtualSTLOBalance < stloAmount) revert InsufficientVirtualSTLO();
            s.virtualPool.virtualSTZSupply -= stzAmount;
            s.virtualPool.virtualSTLOBalance -= stloAmount;
        }
        
        s.virtualPool.k = s.virtualPool.virtualSTZSupply * s.virtualPool.virtualSTLOBalance;

        emit VirtualPoolUpdated(creatorId, s.virtualPool.virtualSTZSupply, s.virtualPool.virtualSTLOBalance);
    }

    /**
     * @dev Executes a P2P trade
     * @param creatorId The ID of the creator
     * @param buyer The address of the buyer
     * @param seller The address of the seller
     * @param amount The amount of Steez traded
     * @param price The price of the Steez
     */
    function executeTrade(string memory creatorId, address buyer, address seller, uint256 amount, uint256 price) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.Steez storage steez = s.steez[creatorId];
        
        require(buyer != seller, "Buyer and seller cannot be the same");
        require(amount > 0, "Trade amount must be greater than zero");
        require(price > 0, "Trade price must be greater than zero");

        uint256 previousPrice = steez.currentPrice;
        uint256 priceChangePercentage = calculatePercentageChange(previousPrice, price);
        if (priceChangePercentage > LibAppStorage.AppConstants.MAX_PRICE_CHANGE_PERCENTAGE) revert ExcessivePriceChange();
        
        uint256 averageVolume = calculateAverageVolume(creatorId);
        if (amount > averageVolume * LibAppStorage.AppConstants.MAX_VOLUME_MULTIPLIER) revert UnusualTradingVolume();
        
        if (s.bazaarData.steezOrderBooksFrozen[creatorId]) revert P2PTradesFrozen();
        if (s.steezInvested[seller][creatorId] < amount) revert InsufficientSellerBalance();
        if (s.balances[buyer] < price * amount) revert InsufficientBuyerFunds();
        if (seller == buyer) revert SellerBuyerSameAddress();

        ensureNotCreator(creatorId, buyer);

        checkAndUpdateTransactionLimit(seller, amount);
        checkAndUpdateTransactionLimit(buyer, amount);

        uint256 totalPrice = price * amount;

        s.steezInvested[seller][creatorId] -= amount;
        s.steezInvested[buyer][creatorId] += amount;

        s.balances[buyer] -= totalPrice;

        updatePrice(creatorId, amount, true);
        updateVirtualPool(creatorId, amount, totalPrice, true);

        LibAppStorage.SteezOrderBook storage trade = s.bazaarData.steezOrderBooks[creatorId];
        trade.steez = steez;
        trade.seller = seller;
        trade.buyer = buyer;
        trade.price = price;
        trade.amount = amount;
        trade.timestamp = block.timestamp;

        emit P2PTradeExecuted(creatorId, seller, buyer, price, amount);
        emit PriceUpdated(creatorId, calculatePrice(creatorId));

        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.P2P;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(totalPrice),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, creatorId, params, BalanceDelta(int256(totalPrice), 0));
        }
    }

    /**
     * @dev Calculates the percentage change between two prices
     * @param oldPrice The old price
     * @param newPrice The new price
     * @return The percentage change
     */
    function calculatePercentageChange(uint256 oldPrice, uint256 newPrice) internal pure returns (uint256) {
        if (oldPrice == 0) return 0;
        uint256 change = oldPrice > newPrice ? oldPrice - newPrice : newPrice - oldPrice;
        return (change * 100) / oldPrice;
    }

    /**
     * @dev Calculates the average trading volume for a creator
     * @param creatorId The ID of the creator
     * @return The average trading volume
     */
    function calculateAverageVolume(string memory creatorId) internal view returns (uint256) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.Steez storage steez = s.steez[creatorId];
        
        uint256 totalVolume = 0;
        uint256 count = 0;
        uint256 currentDay = block.timestamp / 1 days;
        
        for (uint256 i = 0; i < 7; ++i) {
            uint256 dayVolume = steez.dailyVolume[currentDay - i];
            if (dayVolume > 0) {
                totalVolume += dayVolume;
                ++count;
            }
        }
        
        if (count == 0) return 0;
        return totalVolume / count;
    }

    /**
     * @dev Sorts the orders based on the given criteria using an optimized in-place QuickSort algorithm
     * @param orders The array of orders to sort
     * @param descending Whether to sort in descending order
     */
    function sortOrders(LibAppStorage.LimitOrder[] storage orders, bool descending) internal {
        uint256 ordersLength = orders.length;
        if (ordersLength <= 1) return;
        
        int256[] memory stack = new int256[](ordersLength);
        int256 top = -1;
        
        stack[++top] = 0;
        stack[++top] = int256(ordersLength - 1);
        
        while (top >= 0) {
            int256 high = stack[top--];
            int256 low = stack[top--];
            
            int256 pivotIndex = int256(uint256(keccak256(abi.encodePacked(block.timestamp, low, high))) % uint256(high - low + 1) + uint256(low));
            
            (orders[uint256(pivotIndex)], orders[uint256(high)]) = (orders[uint256(high)], orders[uint256(pivotIndex)]);
            LibAppStorage.LimitOrder storage pivot = orders[uint256(high)];
            
            int256 i = low - 1;
            
            for (int256 j = low; j < high; ++j) {
                if (descending ? 
                    (orders[uint256(j)].price > pivot.price || (orders[uint256(j)].price == pivot.price && orders[uint256(j)].timestamp < pivot.timestamp)) :
                    (orders[uint256(j)].price < pivot.price || (orders[uint256(j)].price == pivot.price && orders[uint256(j)].timestamp > pivot.timestamp))) {
                    ++i;
                    (orders[uint256(i)], orders[uint256(j)]) = (orders[uint256(j)], orders[uint256(i)]);
                }
            }
            
            (orders[uint256(i + 1)], orders[uint256(high)]) = (orders[uint256(high)], orders[uint256(i + 1)]);
            
            if (i > low) {
                stack[++top] = low;
                stack[++top] = i;
            }
            
            if (i + 2 < high) {
                stack[++top] = i + 2;
                stack[++top] = high;
            }
        }
    }

    /**
     * @dev Checks and updates the daily transaction limit for a trader
     * @param trader The address of the trader
     * @param amount The amount of Steez traded
     */
    function checkAndUpdateTransactionLimit(address trader, uint256 amount) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (trader == address(0)) revert InvalidTraderAddress();
        if (amount == 0) revert InvalidTradeAmount();
        uint256 today = block.timestamp / 1 days;
        uint256 currentDailyAmount = s.dailyTransactionAmounts[trader][today];
        
        if (currentDailyAmount + amount > s.MAX_DAILY_TRANSACTION_AMOUNT) revert DailyTransactionLimitExceeded();
        
        s.dailyTransactionAmounts[trader][today] = currentDailyAmount + amount;
    }
    
    /**
     * @dev Returns the minimum of two numbers
     * @param a The first number
     * @param b The second number
     * @return The smaller of the two input numbers
     */
    function getMinimum(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
    * @dev Cancels all active limit orders for a creator
    * @param creatorId The ID of the creator
    */
    function cancelAllActiveLimitOrders(string memory creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        LibAppStorage.LimitOrder[] storage activeOrders = s.bazaarData.activeLimitOrders[creatorId];

        uint256 length = activeOrders.length;
        for (uint256 i = 0; i < length; ++i) {
            uint256 orderId = activeOrders[i].orderId;
            s.bazaarData.limitOrders[orderId].status = LibAppStorage.OrderStatus.Cancelled;
            
            emit LimitOrderCancelled(creatorId, orderId);
        }
        
        delete s.bazaarData.activeLimitOrders[creatorId];

        emit AllLimitOrdersCancelled(creatorId);
    }

    /**
     * @dev Executes a content trade
     * @param content The content to be traded
     * @param seller The address of the seller
     * @param buyer The address of the buyer
     * @param price The price of the content
     */
    function executeContentTrade(LibAppStorage.Content calldata content, address seller, address buyer, uint256 price) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        if (s.creatorContent[content.creatorId][content.contentId].creatorAddress != seller) revert SellerDoesNotOwnContent();
        
        // Transfer STLO tokens from buyer to seller
        if (!s.steeloAddress.safeTransferFrom(buyer, seller, price)) revert STLOTransferFailed();

        // Transfer content ownership
        s.creatorContent[content.creatorId][content.contentId].creatorAddress = buyer;

        emit ContentTraded(content.creatorId, content.contentId, seller, buyer, price);
        
        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.ContentTrade;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(price),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, content.creatorId, params, BalanceDelta(int256(price), 0));
        }
    }

    /**
     * @dev Executes a content auction
     * @param steez The Steez struct for the creator
     * @param contentId The ID of the content
     * @param buyer The address of the buyer
     * @param price The price of the content
     */
    function executeContentAuction(LibAppStorage.Steez storage steez, string memory contentId, address buyer, uint256 price) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        // Ensure the content doesn't already exist
        if (s.creatorContent[steez.creatorId][contentId].creatorAddress != address(0)) revert ContentAlreadyExists();

        // Transfer STLO tokens from buyer to contract
        if (!s.steeloAddress.safeTransferFrom(buyer, address(this), price)) revert STLOTransferFailed();

        // Mint new content NFT
        LibSteez.mintContent(steez.creatorId, contentId, buyer);

        emit ContentAuctioned(steez.creatorId, contentId, buyer, price);

        LibAppStorage.BazaarState state = LibAppStorage.BazaarState.ContentAuction;

        if (address(s.hooks) != address(0)) {
            IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                zeroForOne: true, // Assuming STLO is token0, adjust if necessary
                amountSpecified: int256(price),
                sqrtPriceLimitX96: 0 // Use 0 for no limit, adjust if needed
            });
            IPoolManager.SwapParams(msg.sender, steez.creatorId, params, BalanceDelta(int256(price), 0));
        }
    }

    /**
     * @dev Executes a multi-step trade to allow users to sell old Steez and buy new Steez
     * @param desiredCreatorId The ID of the desired Steez
     * @param desiredAmount The amount of the desired Steez
     * @param ownedCreatorIds The IDs of the Steez owned by the buyer
     * @return success Whether the trade was successful
     */
    function sellOldToBuyNew(
        string memory desiredCreatorId,
        uint256 desiredAmount,
        string[] memory ownedCreatorIds
    ) internal  returns (bool success) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        address buyer = msg.sender;

        uint256 desiredPrice = s.steez[desiredCreatorId].currentPrice;
        uint256 totalCost = desiredPrice * desiredAmount;
        uint256 totalFunds = 0;

        // Find highest buy requests for owned Steez
        for (uint256 i = 0; i < ownedCreatorIds.length; i++) {
            LibAppStorage.LimitOrder[] storage buyOrders = s.bazaarData.activeLimitOrders[ownedCreatorIds[i]];
            if (buyOrders.length > 0) {
                LibAppStorage.sortOrders(buyOrders, true); // Sort in descending order
                LibAppStorage.LimitOrder storage highestBuyOrder = buyOrders[0];
                uint256 ownedAmount = s.steezInvested[buyer][ownedCreatorIds[i]];
                uint256 saleAmount = ownedAmount < highestBuyOrder.amount ? ownedAmount : highestBuyOrder.amount;
                totalFunds += saleAmount * highestBuyOrder.price;
            }
        }

        if (totalFunds < totalCost) revert InsufficientFunds();

        // Execute sales and purchase
        uint256 remainingCost = totalCost;
        for (uint256 i = 0; i < ownedCreatorIds.length && remainingCost > 0; i++) {
            LibAppStorage.LimitOrder[] storage buyOrders = s.bazaarData.activeLimitOrders[ownedCreatorIds[i]];
            if (buyOrders.length == 0) continue;

            LibAppStorage.sortOrders(buyOrders, true); // Sort in descending order
            LibAppStorage.LimitOrder storage highestBuyOrder = buyOrders[0];
            uint256 ownedAmount = s.steezInvested[buyer][ownedCreatorIds[i]];
            uint256 saleAmount = ownedAmount < highestBuyOrder.amount ? ownedAmount : highestBuyOrder.amount;
            
            if (saleAmount > remainingCost / highestBuyOrder.price) {
                saleAmount = remainingCost / highestBuyOrder.price;
            }

            uint256 saleValue = saleAmount * highestBuyOrder.price;

            // Execute sale
            executeTrade(ownedCreatorIds[i], highestBuyOrder.trader, buyer, saleAmount, highestBuyOrder.price);
            remainingCost -= saleValue;

            // Update limit order
            highestBuyOrder.amount -= saleAmount;
            if (highestBuyOrder.amount == 0) {
                LibAppStorage.removeLimitOrder(s, ownedCreatorIds[i], 0);
            }
        }

        // Purchase desired Steez
        executeTrade(desiredCreatorId, buyer, address(0), desiredAmount, desiredPrice);

        // Handle refund if necessary
        if (remainingCost < 0) {
            uint256 refund = uint256(-remainingCost);
            s.balances[buyer] += refund;
        }

        emit SellOldBuyNewExecuted(buyer, desiredCreatorId, desiredAmount, totalCost - remainingCost);

        // Call afterSwap hooks
        if (address(s.hooks) != address(0)) {
            for (uint256 i = 0; i < ownedCreatorIds.length; i++) {
                IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
                    zeroForOne: true,
                    amountSpecified: int256(s.steezInvested[buyer][ownedCreatorIds[i]]),
                    sqrtPriceLimitX96: 0
                });
                IPoolManager.SwapParams(msg.sender, ownedCreatorIds[i], params, BalanceDelta(int256(s.steezInvested[buyer][ownedCreatorIds[i]]), 0));
            }
            
            IPoolManager.SwapParams memory desiredParams = IPoolManager.SwapParams({
                zeroForOne: false,
                amountSpecified: int256(desiredAmount),
                sqrtPriceLimitX96: 0
            });
            IPoolManager.SwapParams(msg.sender, desiredCreatorId, desiredParams, BalanceDelta(0, int256(desiredAmount)));
        }

        return true;
    }

    /**
     * @dev Swaps ETH for STLO
     * @param minAmountSTLO The minimum amount of STLO to receive
     * @return amountSTLO The amount of STLO received
     */
    function swapETHForSTLO(uint256 minAmountSTLO) internal payable returns (uint256 amountSTLO) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();
        if (msg.value == 0) revert InvalidSwapAmount();

        IERC20 STLO = IERC20(s.steeloAddress);

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(address(STLO)),
            fee: LibAppStorage.AppConstants.SWAP_FEE,
            tickSpacing: LibAppStorage.AppConstants.TICK_SPACING,
            hooks: s.hooks
        });

        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: int256(msg.value),
            sqrtPriceLimitX96: 0
        });

        BalanceDelta delta = s.poolManager.swap(key, params);
        amountSTLO = uint256(-delta.amount1());
        if (amountSTLO < minAmountSTLO) revert InsufficientOutputAmount();

        STLO.safeTransfer(msg.sender, amountSTLO);

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        s.dailyVolume[today] += amountSTLO;

        emit ETHSwappedForSTLO(msg.sender, msg.value, amountSTLO);
        return amountSTLO;
    }

    /**
     * @dev Swaps tokens using the pool manager
     * @param key The pool key
     * @param params The swap parameters
     * @return delta The balance delta
     */
    function swap(PoolKey memory key, IPoolManager.SwapParams memory params) internal returns (BalanceDelta delta) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();
        if (params.amountSpecified == 0) revert InvalidSwapAmount();

        // Check for valid feeTier
        if (key.fee != 100 && key.fee != 500 && key.fee != 3000 && key.fee != 10000) revert InvalidFeeTier();

        // Check for valid tickSpacing
        if (key.tickSpacing != 1 && key.tickSpacing != 10 && key.tickSpacing != 60) revert InvalidTickSpacing();

        // Ensure sqrtPriceLimitX96 is not zero
        if (params.sqrtPriceLimitX96 == 0) {
            params.sqrtPriceLimitX96 = params.zeroForOne ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1;
        }

        bytes memory unlockData = abi.encode(key, params);
        
        delta = s.poolManager.unlock(unlockData);
        
        // Update tick after swap
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = s.poolManager.getSlot0(PoolIdLibrary.toId(key));
        s.pools[PoolIdLibrary.toId(key)].tick = tick;
        
        return delta;
    }

    /**
     * @dev Swaps tokens across multiple pools
     * @param keys The pool keys
     * @param params The swap parameters
     * @return deltas The balance deltas
     * @return successfulSwaps The number of successful swaps
     */
    function multiPoolSwap(PoolKey[] memory keys, IPoolManager.SwapParams[] memory params) internal returns (BalanceDelta[] memory deltas, uint256 successfulSwaps) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();
        if (keys.length == 0 || params.length == 0) revert InvalidSwapParameters();
        if (keys.length != params.length) revert MismatchedKeysAndParams();

        bytes memory unlockData = abi.encode(keys, params);
        
        (deltas, successfulSwaps) = abi.decode(s.poolManager.unlock(unlockData), (BalanceDelta[], uint256));

        return (deltas, successfulSwaps);
    }

    /**
     * @dev Callback function for unlocking and executing swaps
     * @param data The encoded swap data
     * @return The encoded result of the swaps
     */
    function unlockCallback(bytes calldata data) internal returns (bytes memory) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();

        (PoolKey[] memory keys, IPoolManager.SwapParams[] memory params) = abi.decode(data, (PoolKey[], IPoolManager.SwapParams[]));
        
        BalanceDelta[] memory deltas = new BalanceDelta[](keys.length);
        uint256 successfulSwaps = 0;

        for (uint i = 0; i < keys.length; i++) {
            if (params[i].amountSpecified == 0) {
                emit SwapSkipped(i, "Invalid swap amount");
                continue;
            }
            try {
                deltas[i] = s.poolManager.swap(keys[i], params[i]);
                successfulSwaps++;
                
                // Update pool state
                (uint160 sqrtPriceX96, int24 tick, , , , , ) = s.poolManager.getSlot0(PoolIdLibrary.toId(keys[i]));
                s.pools[PoolIdLibrary.toId(keys[i])].sqrtPriceX96 = sqrtPriceX96;
                s.pools[PoolIdLibrary.toId(keys[i])].tick = tick;

                emit MultiPoolSwapExecuted(i, keys[i].currency0, keys[i].currency1, deltas[i].amount0(), deltas[i].amount1());
            } catch (bytes memory reason) {
                string memory errorMessage = string(abi.encodePacked("Swap failed for pool ", i, ": ", string(reason)));
                emit SwapFailed(i, errorMessage);
            }
        }

        if (successfulSwaps == 0) revert AllSwapsFailed();

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        for (uint i = 0; i < keys.length; i++) {
            s.dailyVolume[today] += uint256(params[i].amountSpecified > 0 ? params[i].amountSpecified : -params[i].amountSpecified);
        }

        return abi.encode(deltas, successfulSwaps);
    }

    /**
     * @dev Adds liquidity to the pool
     * @param creatorId The ID of the creator
     * @param amount0Desired The desired amount of token0
     * @param amount1Desired The desired amount of token1
     * @param amount0Min The minimum amount of token0
     * @param amount1Min The minimum amount of token1
     * @param recipient The address to receive the liquidity tokens
     * @return liquidity The amount of liquidity added
     * @return amount0 The actual amount of token0 added
     * @return amount1 The actual amount of token1 added
     */
    function addLiquidity(
        string memory creatorId,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient
    ) internal returns (uint256 liquidity, uint256 amount0, uint256 amount1) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        PoolKey memory key = getPoolKey(s, creatorId);
        
        IPoolManager.ModifyPositionParams memory params = IPoolManager.ModifyPositionParams({
            tickLower: TickMath.MIN_TICK,
            tickUpper: TickMath.MAX_TICK,
            liquidityDelta: int256(amount0Desired)  // This is an approximation, actual liquidity will be calculated by Uniswap
        });

        BalanceDelta delta = s.poolManager.modifyPosition(key, params);

        amount0 = uint256(delta.amount0());
        amount1 = uint256(delta.amount1());

        require(amount0 >= amount0Min && amount1 >= amount1Min, "Slippage check failed");

        liquidity = uint256(params.liquidityDelta);

        // Update user's liquidity position
        s.liquidityPositions[creatorId][recipient].liquidity += liquidity;
        s.liquidityPositions[creatorId][recipient].amount0 += amount0;
        s.liquidityPositions[creatorId][recipient].amount1 += amount1;

        emit LiquidityAdded(creatorId, recipient, amount0, amount1, liquidity);

        return (liquidity, amount0, amount1);
    }

    /**
     * @dev Removes liquidity from the pool
     * @param creatorId The ID of the creator
     * @param liquidity The amount of liquidity to remove
     * @param amount0Min The minimum amount of token0 to receive
     * @param amount1Min The minimum amount of token1 to receive
     * @param recipient The address to receive the tokens
     * @return amount0 The actual amount of token0 received
     * @return amount1 The actual amount of token1 received
     */
    function removeLiquidity(
        string memory creatorId,
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient
    ) internal returns (uint256 amount0, uint256 amount1) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        
        // Input validation
        require(bytes(creatorId).length > 0, "Invalid creator ID");
        require(liquidity > 0, "Liquidity must be greater than 0");
        require(amount0Min > 0 && amount1Min > 0, "Minimum amounts must be greater than 0");
        require(recipient != address(0), "Invalid recipient address");

        PoolKey memory key = getPoolKey(s, creatorId);
        
        // Check if user has sufficient liquidity
        require(s.liquidityPositions[creatorId][msg.sender].liquidity >= liquidity, "Insufficient liquidity");

        IPoolManager.ModifyPositionParams memory params = IPoolManager.ModifyPositionParams({
            tickLower: TickMath.MIN_TICK,
            tickUpper: TickMath.MAX_TICK,
            liquidityDelta: -int256(liquidity)
        });

        BalanceDelta delta = s.poolManager.modifyPosition(key, params);

        amount0 = uint256(-delta.amount0());
        amount1 = uint256(-delta.amount1());

        require(amount0 >= amount0Min && amount1 >= amount1Min, "Slippage check failed");

        // Update user's liquidity position
        s.liquidityPositions[creatorId][msg.sender].liquidity -= liquidity;
        s.liquidityPositions[creatorId][msg.sender].amount0 -= amount0;
        s.liquidityPositions[creatorId][msg.sender].amount1 -= amount1;
        // Transfer tokens to recipient
        require(s.steeloAddress.safeTransferFrom(address(this), recipient, amount0), "Token0 transfer failed");
        require(s.steez[creatorId].creatorAddress.safeTransferFrom(address(this), recipient, amount1), "Token1 transfer failed");

        emit LiquidityRemoved(creatorId, recipient, amount0, amount1, liquidity);

        return (amount0, amount1);
    }

    /**
     * @dev Retrieves the liquidity position for a given creator and user
     * @param creatorId The ID of the creator
     * @param user The address of the user
     * @return liquidity The amount of liquidity tokens
     * @return amount0 The amount of token0
     * @return amount1 The amount of token1
     */
    function getLiquidityPosition(string memory creatorId, address user) internal view returns (uint256 liquidity, uint256 amount0, uint256 amount1) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        LibAppStorage.LiquidityPosition storage position = s.liquidityPositions[creatorId][user];
        
        return (position.liquidity, position.amount0, position.amount1);
    }

    /**
     * @dev Retrieves all liquidity positions for a given user
     * @param user The address of the user
     * @return creatorIds An array of creator IDs
     * @return liquidities An array of liquidity amounts
     * @return amounts0 An array of token0 amounts
     * @return amounts1 An array of token1 amounts
     */
    function getAllLiquidityPositions(address user) internal view returns (
        string[] memory creatorIds,
        uint256[] memory liquidities,
        uint256[] memory amounts0,
        uint256[] memory amounts1
    ) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        uint256 positionCount = 0;

        // First, count the number of positions
        for (uint256 i = 0; i < s.creatorList.length; i++) {
            if (s.liquidityPositions[s.creatorList[i]][user].liquidity > 0) {
                positionCount++;
            }
        }

        // Initialize arrays with the correct size
        creatorIds = new string[](positionCount);
        liquidities = new uint256[](positionCount);
        amounts0 = new uint256[](positionCount);
        amounts1 = new uint256[](positionCount);

        // Fill the arrays with position data
        uint256 index = 0;
        for (uint256 i = 0; i < s.creatorList.length; i++) {
            string memory creatorId = s.creatorList[i];
            LibAppStorage.LiquidityPosition storage position = s.liquidityPositions[creatorId][user];
            if (position.liquidity > 0) {
                creatorIds[index] = creatorId;
                liquidities[index] = position.liquidity;
                amounts0[index] = position.amount0;
                amounts1[index] = position.amount1;
                index++;
            }
        }

        return (creatorIds, liquidities, amounts0, amounts1);
    }

    /**
     * @dev Executes automatic liquidity provision based on predefined rules
     * @param creatorId The ID of the creator
     */
    function executeAutoLiquidity(string memory creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        require(bytes(creatorId).length > 0, "Invalid creator ID");

        AutoLiquidityRule memory rule = s.autoLiquidityRules[creatorId];
        require(rule.targetRatio > 0, "Auto-liquidity rule not set");
        
        PoolKey memory key = getPoolKey(s, creatorId);
        (uint160 sqrtPriceX96, , , , , , ) = s.poolManager.getSlot0(PoolIdLibrary.toId(key));
        uint256 currentRatio = uint256(sqrtPriceX96) * uint256(sqrtPriceX96) / (1 << 192);
        
        if (abs(int256(currentRatio) - int256(rule.targetRatio)) > int256(rule.rebalanceThreshold)) {
            uint256 amount0 = 1000 * 1e18; // Example amount, need to be made configurable
            uint256 amount1 = amount0 * rule.targetRatio / (1 << 96);
            
            require(IERC20(s.steeloAddress).balanceOf(address(this)) >= amount0, "Insufficient token0 balance for auto-liquidity");
            require(IERC20(s.steez[creatorId].creatorAddress).balanceOf(address(this)) >= amount1, "Insufficient token1 balance for auto-liquidity");

            (uint256 liquidity, uint256 added0, uint256 added1) = addLiquidity(
                creatorId,
                amount0,
                amount1,
                amount0 * (100 - rule.maxSlippage) / 100,
                amount1 * (100 - rule.maxSlippage) / 100,
                address(this)
            );
            
            emit AutoLiquidityExecuted(creatorId, added0, added1, liquidity);
        }
    }

    /**
     * @dev Sets the auto-liquidity rule for a specific creator
     * @param creatorId The ID of the creator
     * @param targetRatio The target ratio for the liquidity pool
     * @param rebalanceThreshold The threshold at which to trigger a rebalance
     * @param maxSlippage The maximum allowed slippage during rebalancing
     */
    function setAutoLiquidityRule(
        string memory creatorId,
        uint256 targetRatio,
        uint256 rebalanceThreshold,
        uint256 maxSlippage
    ) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        s.autoLiquidityRules[creatorId] = AutoLiquidityRule({
            targetRatio: targetRatio,
            rebalanceThreshold: rebalanceThreshold,
            maxSlippage: maxSlippage
        });
    }

    /**
     * @dev Retrieves the auto-liquidity rule for a specific creator
     * @param creatorId The ID of the creator
     * @return targetRatio The target ratio for the liquidity pool
     * @return rebalanceThreshold The threshold at which to trigger a rebalance
     * @return maxSlippage The maximum allowed slippage during rebalancing
     */
    function getAutoLiquidityRule(string memory creatorId) internal view returns (
        uint256 targetRatio,
        uint256 rebalanceThreshold,
        uint256 maxSlippage
    ) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        AutoLiquidityRule storage rule = s.autoLiquidityRules[creatorId];
        return (rule.targetRatio, rule.rebalanceThreshold, rule.maxSlippage);
    }

    /**
     * @dev Gets the pool key for a given creator
     * @param s The AppStorage struct
     * @param creatorId The ID of the creator
     * @return key The PoolKey for the creator's pool
     */
    function getPoolKey(LibAppStorage.AppStorage storage s, string memory creatorId) internal view returns (PoolKey memory) {
        address steez = s.steez[creatorId].creatorAddress;
        return PoolKey({
            currency0: Currency.wrap(address(s.steeloAddress)),
            currency1: Currency.wrap(steez),
            fee: s.pools[creatorId].fee,
            tickSpacing: s.pools[creatorId].tickSpacing,
            hooks: s.hooks
        });
    }

    /**
     * @dev Handles the lock acquired event
     * @param data The lock data
     * @return result The result of the callback
     */
    function lockAcquired(bytes calldata data) internal returns (bytes memory result) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.paused) revert ContractPaused();

        (PoolKey memory key, IPoolManager.SwapParams memory params) = abi.decode(data, (PoolKey, IPoolManager.SwapParams));
        
        // Validate input parameters
        if (params.amountSpecified == 0) revert InvalidSwapAmount();
        if (params.sqrtPriceLimitX96 == 0) revert InvalidSqrtPriceLimit();

        // Execute the swap
        BalanceDelta delta = s.poolManager.swap(key, params);
        
        // Update pool state
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = s.poolManager.getSlot0(PoolIdLibrary.toId(key));
        s.pools[PoolIdLibrary.toId(key)].sqrtPriceX96 = sqrtPriceX96;
        s.pools[PoolIdLibrary.toId(key)].tick = tick;

        // Update daily volume
        uint256 today = block.timestamp / 1 days;
        s.dailyVolume[today] += uint256(params.amountSpecified > 0 ? params.amountSpecified : -params.amountSpecified);

        // Emit detailed swap event
        emit SwapExecuted(key.currency0, key.currency1, delta.amount0(), delta.amount1(), sqrtPriceX96, tick, msg.sender);
        
        // Return encoded delta for further processing
        result = abi.encode(delta);
        return result;
    }

    /**
     * @dev Checks if a pool exists
     * @param key The pool key
     * @return True if the pool exists, false otherwise
     */
    function poolExists(PoolKey memory key) internal view returns (bool) {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        return s.poolManager.getSlot0(PoolIdLibrary.toId(key)).sqrtPriceX96 != 0;
    }

    /**
     * @dev Settles the pool manager
     * @param currency The currency to settle
     * @param amount The amount to settle
     */
    function settle(Currency currency, uint256 amount) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (amount == 0) revert InvalidAmount();
        
        if (currency.isNative()) {
            s.poolManager.settle{value: amount}(currency);
        } else {
            address token = Currency.unwrap(currency);
            s.steeloAddress.safeTransfer(address(s.poolManager), amount);
            s.poolManager.settle(currency);
        }
    }

    /**
     * @dev Helper function to ensure the buyer is not the creator
     * @param creatorId The ID of the creator
     * @param buyer The address of the buyer
     */
    function ensureNotCreator(string memory creatorId, address buyer) internal view {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (s.creators[creatorId].profileAddress == buyer) revert CreatorCannotPurchaseOwnTokens();
    }

    /**
     * @dev Updates the state of the Bazaar
     * @param newState The new state to set
     */
    function setState(LibAppStorage.BazaarState newState) private {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        s.bazaarState = newState;
        emit BazaarStateChanged(newState);
    }
}