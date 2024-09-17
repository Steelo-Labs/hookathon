// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibBazaarRouter} from "../libraries/LibBazaarRouter.sol";
import {AppConstants} from "../libraries/LibAppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

/**
 * @title BazaarRouterFacet
 * @dev This contract manages the Bazaar Router functionality for the Steelo platform,
 *      including initializing pools, handling pre-orders, launches, anniversaries,
 *      and executing trades. It uses the Diamond Standard (EIP-2535) for modularity 
 *      and upgradability.
 * 
 * @notice The contract provides various functionalities to interact with Steelo's 
 *         Bazaar system, including pool management, token lifecycle handling, 
 *         and trading operations.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibBazaarRouter: Manages the core functionality related to Bazaar operations.
 * - LibDiamond: Handles Diamond Standard related operations.
 * 
 * External Libraries:
 * - PoolKey: Uniswap V4 pool key type.
 * - IPoolManager: Uniswap V4 pool manager interface.
 * - Currency: Uniswap V4 currency type.
 * 
 * Events:
 * - PreOrderStarted: Emitted when a pre-order phase is started.
 * - BidPlaced: Emitted when a bid is placed during pre-order.
 * - LaunchStarted: Emitted when a launch phase is started.
 * - TokenMinted: Emitted when a token is minted.
 * - AnniversaryStarted: Emitted when an anniversary phase is started.
 * - P2PTradeExecuted: Emitted when a peer-to-peer trade is executed.
 * - SteezForSteezExecuted: Emitted when a Steez-for-Steez trade is executed.
 * - LimitOrdersCancelled: Emitted when limit orders are cancelled.
 * - Swapped: Emitted when a token swap occurs.
 */
contract BazaarRouterFacet {
    LibAppStorage.AppStorage internal s = LibAppStorage.diamondStorage();

    // Events
    event PreOrderStarted(string indexed creatorId, uint256 startTime, uint256 floorPrice);
    event BidPlaced(string indexed creatorId, address indexed bidder, uint256 amount, LibAppStorage.BidType bidType, uint256 maxBid);
    event LaunchStarted(string indexed creatorId, uint256 startTime);
    event TokenMinted(string indexed creatorId, address indexed buyer, uint256 tokenId, uint256 price);
    event AnniversaryStarted(string indexed creatorId, uint256 startTime, uint256 tokenCount);
    event P2PTradeExecuted(string indexed creatorId, address indexed seller, address indexed buyer, uint256 price);
    event SteezForSteezExecuted(string indexed creatorId1, string indexed creatorId2, address indexed owner1, address owner2, uint256 additionalPayment);
    event LimitOrdersCancelled(string indexed creatorId);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Paused(address account);
    event Unpaused(address account);
    
    modifier whenNotPaused() {
        AppStorage storage s = diamondStorage();
        require(!s.paused, "Pausable: paused");
        _;
    }

    // enum BazaarState { Inactive, PreOrder, Launch, P2P, Anniversary, SteezForSteez, ContentTrade, ContentAuction }
    modifier inState(LibAppStorage.BazaarState requiredState) {
        if (LibAppStorage.diamondStorage().bazaarState != requiredState) revert InvalidState();
        _;
    }

    modifier onlyApprovedCreator() {
        if (!LibAppStorage.diamondStorage().approvedCreators[msg.sender]) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != LibDiamond.contractOwner()) revert Unauthorized();
        _;
    }

    function initialize(address _poolManager, address _STLO, address _paymentToken, address _STZ) external {
        LibBazaarRouter.initialize(_poolManager, _STLO, _paymentToken, _STZ);
    }

    function requestSteezCreation(string memory creatorId) external {
        LibBazaarRouter.requestSteezCreation(msg.sender, creatorId);
    }

    function approveCreator(address creator) external {
        LibBazaarRouter.approveCreator(creator);
    }

    function createSteezPool(
        string memory creatorId,
        uint24 feeTier,
        int24 tickSpacing,
        uint256 initialPrice
    ) external returns (bytes32 poolId) {
        return LibBazaarRouter.initializeSteezPool(creatorId, feeTier, tickSpacing, initialPrice);
    }

    function startPreOrder(LibAppStorage.Steez calldata steez) external {
        LibBazaarRouter.startPreOrder(steez);
        emit PreOrderStarted(steez.creatorId, block.timestamp, LibAppStorage.getPreOrderCurrentFloorPrice(s, steez.creatorId));
    }

    // enum BidType { Normal, Higher, Auto }
    function bidPreOrder(LibAppStorage.Steez calldata steez, uint256 amount, LibAppStorage.BidType bidType, uint256 maxBid) external {
        LibBazaarRouter.placeBid(steez, amount, bidType, maxBid);
        emit BidPlaced(steez.creatorId, msg.sender, amount, bidType, maxBid);
    }

    function finalizeBids(LibAppStorage.Steez calldata steez) external {
        LibBazaarRouter.finalizeBids(steez);
    }

    function startLaunch(LibAppStorage.Steez calldata steez) external {
        LibBazaarRouter.startLaunch(steez);
        emit LaunchStarted(steez.creatorId, block.timestamp);
    }

    function mintLaunch(LibAppStorage.Steez calldata steez, address buyer) external {
        uint256 tokenId = LibBazaarRouter.mintLaunch(steez, buyer);
        emit TokenMinted(steez.creatorId, buyer, tokenId, LibAppStorage.getLaunchFinalPrice(s, steez.creatorId));
    }

    function startAnniversary(LibAppStorage.Steez calldata steez) external {
        LibBazaarRouter.startAnniversary(steez);
        emit AnniversaryStarted(steez.creatorId, block.timestamp, AppConstants.ANNIVERSARY_TOKEN_COUNT);
    }

    function mintAnniversary(LibAppStorage.Steez calldata steez, address buyer) external {
        uint256 tokenId = LibBazaarRouter.mintAnniversary(steez, buyer);
        emit TokenMinted(steez.creatorId, buyer, tokenId, LibAppStorage.getAnniversaryFinalPrice(s, steez.creatorId));
    }

    function executeSteezOrderBook(LibAppStorage.Steez calldata steez, address seller, address buyer, uint256 price) external {
        LibBazaarRouter.executeTrade(steez.creatorId, buyer, seller, 1, price);
        emit P2PTradeExecuted(steez.creatorId, seller, buyer, price);
    }

    function executeSteezForSteez(
        LibAppStorage.Steez calldata steez1,
        LibAppStorage.Steez calldata steez2,
        uint256 steez1Quantity,
        uint256 steez2Quantity,
        address owner1,
        address owner2
    ) external {
        LibBazaarRouter.executeSteezForSteez(steez1, steez2, steez1Quantity, steez2Quantity, owner1, owner2);
        emit SteezForSteezExecuted(steez1.creatorId, steez2.creatorId, owner1, owner2, steez2Quantity - steez1Quantity);
    }

    function createLimitOrder(string memory creatorId, uint256 amount, uint256 price, bool isBuyOrder) external returns (uint256) {
        return LibBazaarRouter.createLimitOrder(creatorId, amount, price, isBuyOrder);
    }

    function updateLimitOrder(string memory creatorId, uint256 orderId, uint256 newAmount, uint256 newPrice) external {
        LibBazaarRouter.updateLimitOrder(creatorId, orderId, newAmount, newPrice);
    }

    function cancelLimitOrder(string memory creatorId, uint256 orderId) external {
        LibBazaarRouter.cancelLimitOrder(creatorId, orderId);
    }

    function cancelAllActiveLimitOrders(string memory creatorId) external {
        LibBazaarRouter.cancelAllActiveLimitOrders(creatorId);
        emit LimitOrdersCancelled(creatorId);
    }

    function swapETHForSTLO(uint256 minAmountSTLO) external payable returns (uint256 amountSTLO) {
        amountSTLO = LibBazaarRouter.swapETHForSTLO{value: msg.value}(minAmountSTLO);
        emit Swapped(msg.sender, address(0), address(s.STLO), msg.value, amountSTLO);
        return amountSTLO;
    }

    function swapTokenForSTLO(address tokenIn, uint256 amountIn, uint256 minAmountSTLO) external returns (uint256 amountSTLO) {
        amountSTLO = LibBazaarRouter.swapTokenForSTLO(msg.sender, tokenIn, amountIn, minAmountSTLO);
        emit Swapped(msg.sender, tokenIn, address(s.STLO), amountIn, amountSTLO);
        return amountSTLO;
    }

    function swapSTLOForToken(uint256 amountSTLO, address tokenOut, uint256 minAmountOut) external returns (uint256 amountOut) {
        amountOut = LibBazaarRouter.swapSTLOForToken(msg.sender, amountSTLO, tokenOut, minAmountOut);
        emit Swapped(msg.sender, address(s.STLO), tokenOut, amountSTLO, amountOut);
        return amountOut;
    }

    function swapSTLOForETH(uint256 amountSTLO, uint256 minAmountETH) external returns (uint256 amountETH) {
        amountETH = LibBazaarRouter.swapSTLOForETH(amountSTLO, minAmountETH);
        emit Swapped(msg.sender, address(s.STLO), address(0), amountSTLO, amountETH);
        return amountETH;
    }

    function addLiquidity(
        string memory creatorId,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient
    ) external returns (uint256 liquidity, uint256 amount0, uint256 amount1) {
        return LibBazaarRouter.addLiquidity(creatorId, amount0Desired, amount1Desired, amount0Min, amount1Min, recipient);
    }

    function removeLiquidity(
        string memory creatorId,
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient
    ) external returns (uint256 amount0, uint256 amount1) {
        return LibBazaarRouter.removeLiquidity(creatorId, liquidity, amount0Min, amount1Min, recipient);
    }

    function executeAutoLiquidity(string memory creatorId) external {
        LibBazaarRouter.executeAutoLiquidity(creatorId);
    }

    function setAutoLiquidityRule(
        string memory creatorId,
        uint256 targetRatio,
        uint256 rebalanceThreshold,
        uint256 maxSlippage
    ) external {
        LibBazaarRouter.setAutoLiquidityRule(creatorId, targetRatio, rebalanceThreshold, maxSlippage);
    }

    function executeContentTrade(LibAppStorage.Content calldata content, address seller, address buyer, uint256 price) external {
        LibBazaarRouter.executeContentTrade(content, seller, buyer, price);
    }

    function executeContentAuction(LibAppStorage.Steez calldata steez, string memory contentId, address buyer, uint256 price) external {
        LibBazaarRouter.executeContentAuction(steez, contentId, buyer, price);
    }

    // enum OrderStatus { Active, Filled, Cancelled }
    function getPreOrderStatus(string memory creatorId) external view returns (uint256 startTime, uint256 endTime, uint256 currentPrice, bool isComplete) {
        LibAppStorage.SteezPreOrder storage preOrder = LibAppStorage.getSteezPreOrder(s, creatorId);
        return (preOrder.startTime, preOrder.endTime, preOrder.currentPrice, preOrder.isComplete);
    }

    function getLaunchStatus(string memory creatorId) external view returns (uint256 startTime, uint256 tokenCount, uint256 currentPrice, bool isComplete) {
        LibAppStorage.SteezLaunch storage launch = LibAppStorage.getSteezLaunch(s, creatorId);
        return (launch.startTime, launch.tokenCount, launch.currentPrice, launch.isComplete);
    }

    function getAnniversaryStatus(string memory creatorId) external view returns (uint256 startTime, uint256 tokenCount, uint256 currentPrice, bool isComplete) {
        LibAppStorage.SteezAnniversary storage anniversary = LibAppStorage.getSteezAnniversary(s, creatorId);
        return (anniversary.startTime, anniversary.tokenCount, anniversary.currentPrice, anniversary.isInProgress);
    }

    function getLiquidityPosition(string memory creatorId, address provider) external view returns (
        uint256 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        return LibBazaarRouter.getLiquidityPosition(creatorId, provider);
    }

    function getAllLiquidityPositions(address user) external view returns (
        string[] memory creatorIds,
        uint256[] memory liquidities,
        uint256[] memory amounts0,
        uint256[] memory amounts1
    ) {
        return LibBazaarRouter.getAllLiquidityPositions(user);
    }

    function getAutoLiquidityRule(string memory creatorId) external view returns (
        uint256 targetRatio,
        uint256 rebalanceThreshold,
        uint256 maxSlippage
    ) {
        return LibBazaarRouter.getAutoLiquidityRule(creatorId);
    }

    function getPoolInfo(PoolKey memory key) external view returns (LibBazaarRouter.UniswapV4Pool memory) {
        return LibBazaarRouter.getPoolInfo(key);
    }

    function poolExists(PoolKey memory key) external view returns (bool) {
        return LibBazaarRouter.poolExists(key);
    }

    function pause() external onlyOwner {
        LibAppStorage.pause();
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        LibAppStorage.unpause();
        emit Unpaused(msg.sender);
    }
}