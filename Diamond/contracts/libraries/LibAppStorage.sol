// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { IHooks } from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import { CurrencyLibrary, Currency } from "@uniswap/v4-core/src/libraries/CurrencyLibrary.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";

library LibAppStorage { // update all variables to use Uncapitalised_Naming_Convention, except for CONSTANT-based variables
    using CurrencyLibrary for Currency;

    event StateChanged(BazaarState newState);

    enum BazaarState { Inactive, PreOrder, Launch, P2P, Anniversary, SteezForSteez, ContentTrade, ContentAuction }
    enum BidType { Normal, Higher, Auto }
    enum OrderStatus { Active, Filled, Cancelled }

    /**
    * @title Steez
    * @dev This struct defines the attributes of a Steez token in the Steelo platform.
    */
    struct Steez {
        Steez steez;

        // Identifiers
        string creatorId; // incremental from last creatorId
        string steezId; // incremental from last steezId
        string baseURI;
        address creatorAddress; // profileId => profileAddress
        bool creatorExists; // if true, creator can no longer create steez
    
        // Tokenomics
        uint256 totalSupply; // 250, 500, 1000, 1500, 2000, etc.
        uint256 transactionCount; // feeds into steeloMintRate
        uint256 currentPrice; // >30 STLO, demand-based
        uint256 oldPrice; // used in launch/anniversary price calculation
        uint256 liquidityPool; // feeds into virtualLiquidityPool
        uint256 totalSteeloPreOrder;
        int256 steezPriceFluctuation; // used for SteezDataBase

        // Bazaar
        BazaarState bazaarState; // preOrder, launch, anniversary, p2p
        uint256 lastMintTime; // used to calculate next mint price
        uint256 anniversaryDate; // anniversary happens yearly
        uint256 preOrderStartTime; // steezPreOrder happens once
        uint256 auctionStartTime; // content
        uint256 auctionSlotsSecured;
        bool auctionConcluded;

        // Price fluctuation data
        uint256 hourGapPercentage; // feeds into steezDataBase
        uint256 dayGapPriceFluctutation; // feeds into steezDataBase

        // Investments and investors
        mapping(address => uint256) SteeloInvestors;
        mapping(address => DailySteeloInvestment[]) steeloDailyInvestments;
        mapping(address => uint256) dayGapSteeloInvestment;
        mapping(address => uint256) latestTimeInvested;
        mapping(uint256 => uint256) dailyVolume;
        DailySteezPrice[] dailySteezPrices;
        LimitOrder[] limitOrders;
        Investor[] investors;
        Royalty royalties;
    }

    /**
    * @title Creator
    * @dev This struct defines a creator in the Steelo platform.
    */
    struct Creator {
        string creatorId;
        address profileAddress;
    }

    /**
    * @title VirtualLiquidityPool
    * @dev This struct defines the virtual liquidity pool in the Steelo platform.
    */
    struct VirtualLiquidityPool {
        uint256 virtualSTZSupply;
        uint256 virtualSTLOBalance;
        uint256 k; // Constant product
    }

    /**
    * @title UniswapV4Data
    * @dev This struct stores Uniswap V4 related data for the Steelo platform.
    */
    struct UniswapV4Data {
        IPoolManager poolManager;
        mapping(bytes32 => PoolKey) pools;
        mapping(address => uint256) ethBalances;
        mapping(address => uint256) stloBalances;
    }

    /**
    * @title PoolKey
    * @dev This struct defines the key for a pool in the Steelo platform.
    */
    struct PoolKey {
        Currency currency0;
        Currency currency1;
        uint24 fee;
        int24 tickSpacing;
        IHooks hooks;
    }

    /**
    * @title SwapParams
    * @dev This struct defines the parameters for a swap in the Steelo platform.
    */
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    /**
    * @title PendingGaslessRebalancing
    * @dev This struct defines the pending gasless rebalancing in the Steelo platform.
    */
    struct PendingGaslessRebalancing {
        bool required;
        uint256 steeloAmount;
        LibAppStorage.BazaarState state;
    }

    /**
    * @title LiquidityPosition
    * @dev This struct defines a liquidity position in the Steelo platform.
    */
    struct LiquidityPosition {
        uint256 liquidity;
        uint256 amount0;
        uint256 amount1;
    }

    /**
    * @title AutoLiquidityRule
    * @dev This struct defines a rule for auto liquidity in the Steelo platform.
    */
    struct AutoLiquidityRule {
        uint256 targetRatio; // to be defined by @Ravi & @Ezra
        uint256 rebalanceThreshold; // to be defined by @Ravi & @Ezra
        uint256 maxSlippage; // to be defined by @Ravi & @Ezra
    }

    /**
    * @title LimitOrder
    * @dev This struct defines a limit order in the Steelo platform.
    */
    struct LimitOrder {
        uint256 orderId;
        address seller;
        uint256 price;
        uint256 amount;
        bool isBuyOrder;
        uint256 timestamp;
    }

    /**
    * @title Bid
    * @dev This struct defines a bid in the Steelo platform.
    */
    struct Bid {
        uint256 price;
        uint256 amount;
        address bidder;
        BidType bidType;
        uint256 maxBid; // For auto bids
    }

    // Steelo Structs
    /**
    * @title DailySteeloInvestment
    * @dev This struct defines the daily investment of steelo of an address.
    */
    struct DailySteeloInvestment {
        uint256 steeloInvested;
        uint256 day;
    }

    /**
    * @title DailyTotalSteeloInvestment
    * @dev This struct defines the total daily investment of steelo of an address.
    */
    struct DailyTotalSteeloInvestment {
        uint256 steeloInvested;
        uint256 day;
    }

    /**
    * @title DailySteezPrice
    * @dev This struct defines the daily price of steez of a creator.
    */
    struct DailySteezPrice {
        uint256 steezPrice;
        uint256 day;
    }

    /**
    * @title SteeloPool
    * @dev Represents a pool for collecting and distributing value in the Bazaar
    */
    struct SteeloPool {
        Steez steez;
        uint256 creatorBalance;
        uint256 steeloBalance;
        uint256 totalInvestorShares;
        mapping(address => uint256) investorBalances;
    }

    /**
    * @title SteezPreOrder
    * @dev Represents a Steez pre-order event
    */
    struct SteezPreOrder {
        Steez steez;
        uint256 startTime;
        uint256 endTime;
        uint256 currentPrice;
        uint256 incrementPrice;
        uint256 totalBids;
        bool isComplete;
        mapping(address => Bid) bids;
        mapping(address => bool) finalizedBids;
    }

    /**
    * @title SteezLaunch
    * @dev Represents a Steez launch event
    */
    struct SteezLaunch {
        Steez steez;
        uint256 startTime;
        uint256 tokenCount;
        uint256 lastSaleTime;
        uint256 currentPrice;
        uint256 totalSales;
        bool isComplete;
    }

    /**
    * @title SteezAnniversary
    * @dev Represents a Steez anniversary event
    */
    struct SteezAnniversary {
        Steez steez;
        uint256 startTime;
        uint256 tokenCount;
        uint256 lastSaleTime;
        uint256 currentPrice;
        uint256 totalSales;
        bool isInProgress;
        uint256 lastCompletionTime;
    }

    /**
    * @title SteezOrderBook
    * @dev Represents a Steez order book entry
    */
    struct SteezOrderBook {
        Steez steez;
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }

    /**
    * @title SteezForSteez
    * @dev Represents a Steez-for-Steez swap
    */
    struct SteezForSteez {
        Steez steez1;
        Steez steez2;
        address owner1;
        address owner2;
        uint256 additionalPayment;
        uint256 timestamp;
    }

    /**
    * @title BazaarData
    * @dev Stores all data related to the Bazaar marketplace
    */
    struct BazaarData {
        mapping(uint256 => uint256) steezTransactionCounts;
        mapping(uint256 => SteeloPool) steeloPools;
        mapping(uint256 => SteezPreOrder) steezPreOrders;
        mapping(uint256 => SteezLaunch) steezLaunches;
        mapping(uint256 => SteezAnniversary) steezAnniversaries;
        mapping(uint256 => SteezOrderBook) steezOrderBooks;
        mapping(uint256 => OrderStatus) steezOrderBooksFrozen;
        mapping(uint256 => SteezForSteez) steezForSteezSwaps;
        mapping(uint256 => LimitOrder[]) activeLimitOrders;
        mapping(string => uint256) gaslessRebalancingCounter;
        address[] creators;
        address steeloTreasury;
        address investorPool;
        uint256 nextOrderId;
    }

    /**
    * @title Seller
    * @dev This struct defines a seller in the peer-to-peer (P2P) marketplace of the Steelo platform.
    */
    struct Seller {
        address sellerAddress;
        uint256 sellingPrice;
        uint256 sellingAmount;
    }

    // Mosaic Structs
    /**
    * @title Content
    * @dev This struct defines the content created by creators in the Steelo platform.
    */
    struct Content {
        string contentId; // incremental from lastContentId
        string creatorId; // creatorId => profileAddress
        string contentURI; // 
        string contentThumbnailUrl; // firebase storage link
        string contentVideoUrl; // firebase storage link
        string contentName; // max 32 characters
        string contentDescription; // max 256 characters
        bool exclusivity; // if true, only investors can view
        uint256 uploadTimestamp; // dd:mm:yy-hh:mm:ss
        address creatorAddress; // creatorId => profileAddress
    }

    /**
    * @title Collaborator
    * @dev This struct defines a Collaborator to the Steelo platform.
    */
    struct Collaborator {
        uint256 creatorId; // Creator1
        uint256 collaboratorId; // Creator2
        uint256 contentId; // from Content struct
        uint256 contribution; // (artistic) role
        uint256 percentage; // if collectible
    }

    // Gallery Structs
    /**
    * @title Investor
    * @dev This struct defines an investor in the Steelo platform.
    */
    struct Investor {
        address investorAddress; // ProfileId => profileAddress
        uint256 investment; // in unfractiable number of STEEZ tokens
    }

    /**
    * @title Medal
    * @dev This struct defines a medal in the Steelo platform.
    */
    struct Medal {
        uint8 tier;
        uint32 lastUpdateTimestamp;
        uint128 progress;
    }

    /**
    * @title MedalCriteria
    * @dev This struct defines the criteria for a medal in the Steelo platform.
    */  
    struct MedalCriteria {
        uint128[5] tierThresholds;
        uint32 decayPeriod;
        uint128 decayAmount;
    }

    /**
    * @title MedalType
    * @dev This enum defines the type of medal in the Steelo platform.
    */
    enum MedalType {
        EarliestInvestor,        // Awarded to users who invested early in a creator
        TopReferrer,             // Awarded to users who have referred many new users
        HighVolumeTrader,        // Awarded to users with high trading volume
        HighestLiquidity,        // Awarded to users who provide significant liquidity
        MostProfitableTrader,    // Awarded to users with the highest trading profits
        TopStaker,               // Awarded to users who stake large amounts or for long periods
        MostActiveCreator,       // Awarded to creators who are consistently active
        BiggestContentCollector, // Awarded to users who collect the most content
        BiggestNetwork,          // Awarded to users with the largest network of connections
        MostDiversePortfolio,    // Awarded to users with a diverse range of investments
        LongestHoldTime,         // Awarded to users who hold assets for extended periods
        BestPredictions,         // Awarded to users with accurate market predictions
        MostInnovativeCreator,   // Awarded to creators with unique and innovative content
        HighestEngagement,       // Awarded to users or creators with high community engagement
        BestCommunityBuilder,    // Awarded to users who foster community growth
        MostConsistentTrader,    // Awarded to users with consistent trading patterns
        HighestQualityContent,   // Awarded to creators producing high-quality content
        FastestGrowing,          // Awarded to users or creators with rapid growth
        MostResilient,           // Awarded to users who perform well in market downturns
        TopCollaborator           // Awarded to users who contribute significantly to the platform
        // ... add other medal types as needed
    }

    // Village Structs
    /**
    * @title Message
    * @dev This struct defines a message sent between users in the Steelo platform.
    */
    struct Message {
        uint256 id; // uint256 halved for 1/ chatId and 2/ messageId
        address sender; // profileId => profileAddress1
        address recipient; // profileId => profileAddress2
        string message; // max 128 characters
        uint256 timeSent; // dd:mm:yy-hh:mm:ss
    }

    /**
    * @title Voter
    * @dev This struct defines a voter for Steelo Improvement Proposals (SIPs) in the Steelo platform.
    */
    struct Voter {
        bool voted; // if true, further votes blocked
        address voter; // profileId => profileAddress
        bool vote; // for or against the SIP
        string role; // role of the voter (creator, community, steelo)
    }

    /**
    * @title SIP
    * @dev This struct defines a Steelo Improvement Proposal (SIP) in the Steelo platform.
    */
    struct SIP {
        uint256 sipId; // incremental from lastSIPId
        string sipType; // creator, community, steelo
        string title; // max 64 characters
        string description; // max 1024 characters
        address proposer; // profileId => profileAddress
        string proposerRole; // creator, community, steelo
        uint256 voteCountForSteelo; // single voice, 0 or 1
        uint256 voteCountAgainstSteelo; // single voice, 1 or 0
        uint256 voteCountForCreator; // can't vote as community
        uint256 voteCountAgainstCreator; // can't vote as community
        uint256 voteCountForCommunity; // unique vote per user
        uint256 voteCountAgainstCommunity; // unique vote per user
        uint256 startTime; // dd:mm:yy-hh:mm:ss
        uint256 endTime; // dd:mm:yy-hh:mm:ss
        bool executed; // if true, no further votes allowed
        string status; // pending, approved, rejected
    }

    // Profile Structs
    /**
    * @title SteezCreationRequest
    * @dev This struct defines a request for a Steez creation in the Steelo platform.
    */
    struct SteezCreationRequest {
        address requester;
        string creatorId;
        bool approved;
        uint256 requestTime;
    }

    /**
    * @title Profile
    * @dev This struct defines a profile in the Steelo platform.
    */
    struct Profile {
        address profileAddress; // safe smart account address
        string profileId; // incremental from lastProfileId
        string profileName;
        string profileAvatar; // firebase storage link
        string profileBio;
        address referrer; // profileId => profileAddress
    }

    // Miscellaneous Structs
    /**
    * @title Staker
    * @dev This struct defines a staker in the Steelo platform.
    */
    struct Staker {
        uint256 amount;
        uint256 timestamp;
    }

    /**
    * @title Unstakers
    * @dev This struct defines an unstaker in the Steelo platform.
    */
    struct Unstakers {
        address account;
        uint256 amount;
    }

    /**
    * @title Royalty
    * @dev This struct defines the royalty distribution for a Steez token in the Steelo platform.
    */
    struct Royalty {
        uint256 creatorRoyalty;
        uint256 steeloRoyalty;
        uint256 investorRoyalty;
    }

    /**
    * @title AppStorage
    * @dev This struct defines the storage layout for the Steelo platform.
    */
    struct AppStorage {
        // Steelo Variables
        string name;
        string symbol;
        address steeloAddress;
        address owner;
        address treasury;
        uint256 totalSupply;
        uint256 supplyCap;
        uint256 _status;
        uint256 steeloCurrentPrice;
        uint256 mintTransactionLimit;
        uint256 lastMintEvent;
        uint256 lastBurnEvent;
        uint256 mintAmount;
        uint256 burnAmount;
        uint256 totalMinted;
        uint256 totalBurned;
        uint256 mintRate;
        uint256 burnRate;
        int256 totalTransactionCount;
        bool steeloInitiated;
        bool tgeExecuted;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowance;
        mapping(address => Staker) stakers;
        mapping(address => uint256) totalSteeloInvested;
        mapping(address => uint256) dayGapTotalSteeloInvestment;
        mapping(address => DailyTotalSteeloInvestment[]) steeloDailyTotalInvestments;
        Unstakers[] unstakers;

        // Steez Variables
        string creatorTokenName;
        string creatorTokenSymbol;
        string baseURI;
        uint256 _lastCreatorId;
        uint256 _lastSteezId;
        string[] allCreatorIds;
        Steez[] allCreators;
        mapping(string => Creator) creators;
        mapping(string => Steez) steez;
        mapping(address => string) creatorIdentity;
        mapping(uint256 => uint256) lastSteezId;
        mapping(address => bool) approvedCreators;
        mapping(address => SteezCreationRequest) steezCreationRequests;
        mapping(address => mapping(string => uint256)) steezInvested;
        mapping(address => mapping(string => bool)) preorderBidFinished;

        // Profile Variables
        uint256 _lastProfileId; // incremental from lastProfileId
        mapping(address => string) userAlias; // profileId => profileName
        mapping(address => string) roles; // profileId => role
        mapping(address => Profile) profiles; // profileId => profileAddress
        mapping(address => mapping(address => bool)) isFollowing;
        mapping(address => mapping(address => bool)) isBlocked;
        mapping(address => mapping(address => bool)) isInvestor; // User invests in Creator
        mapping(address => mapping(address => bool)) isInvestee; // Creator is invested in by User
        mapping(address => mapping(address => bool)) isPending;
        mapping(address => mapping(address => bool)) isRequested;
        mapping(address => mapping(address => bool)) isCollaborator; // Creator has collaborated with User

        // Bazaar Variables
        bool steezInitiated;
        bool P2PTransaction;
        uint256 popInvestorIndex;
        uint256 popInvestorPrice;
        uint256 MAX_DAILY_TRANSACTION_AMOUNT;
        address WETHAddress;
        address popInvestorAddress;
        address P2PSeller;
        mapping(string => mapping(address => LiquidityPosition)) liquidityPositions;
        mapping(string => AutoLiquidityRule) autoLiquidityRules;
        mapping(string => Seller[]) sellers;
        mapping(string => uint256) totalSteezTransaction;
        mapping(string => uint256) mintingTransactionLimit;
        mapping(address => mapping(uint256 => uint256)) dailyTransactionAmounts;
        mapping(string => PendingGaslessRebalancing) pendingGaslessRebalancing;
        BazaarData bazaarData;
        IPoolManager poolManager;
        IHooks hooks;
        BazaarState bazaarState;
        VirtualLiquidityPool virtualPool;
        UniswapV4Data uniswapV4Data;

        // Mosaic Variables
        Content[] collections;
        mapping(string => Content[]) creatorCollections;
        mapping(string => mapping(string => Content)) creatorContent;
        mapping(string => Collaborator[]) collaborators;

        // Village Variables
        uint256 messageCounter;
        uint256 _lastSIPId;
        SIP[] allSIPs;
        mapping(string => Message[]) posts;
        mapping(uint256 => SIP) sips;
        mapping(uint256 => mapping(address => Voter)) votes;
        mapping(string => mapping(address => address[])) contacts;
        mapping(string => mapping(address => mapping(address => Message[]))) p2pMessages;

        // Gallery Variables
        mapping(address => mapping(string => bool)) hasUserTradedSteez;
        mapping(address => mapping(uint8 => Medal)) userMedals;
        mapping(uint8 => MedalCriteria) medalCriteria;


        // Access Control Variables
        mapping(address => bool) userMembers;
        mapping(address => bool) executiveMembers;
        mapping(address => bool) adminMembers;
        mapping(address => bool) employeeMembers;
        mapping(address => bool) testerMembers;
        mapping(address => bool) stakerMembers;
        mapping(address => bool) visitorMembers;
        mapping(address => bool) creatorMembers;
        mapping(address => bool) teamMembers;
        mapping(address => bool) collaboratorMembers;
        mapping(address => bool) investorMembers;
        mapping(address => bool) moderatorMembers;
        mapping(address => bool) subscriberMembers;

        // Miscellaneous Variables
        bool accessInitialized;
        bool paused; // Circuit breaker
    }

    function diamondStorage() internal pure returns (AppStorage storage ds) {
        bytes32 position = keccak256("diamond.standard.diamond.storage");
        assembly {
            ds.slot := position
        }
    }

    function setHooks(AppStorage storage s, address hooksAddress) internal {
        s.hooks = IHooks(hooksAddress);
    }

    /**
    * @dev This function initializes the Uniswap V4 pool for ETH/STLO pair.
    * @param poolManager The address of the Uniswap V4 pool manager.
    * @param fee The fee tier for the pool.
    * @param sqrtPriceX96 The initial sqrt price of the pool.
    * @param tickSpacing The tick spacing for the pool.
    */
    function initializeUniswapV4Pool(AppStorage storage s, address poolManager, uint24 fee, uint160 sqrtPriceX96, int24 tickSpacing) internal {
        s.uniswapV4Data.poolManager = IPoolManager(poolManager);
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(s.steeloAddress)),
            currency1: Currency.wrap(address(0)),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0)) // No hooks for now, as per latest Uniswap v4 structure
        });
        bytes32 poolId = PoolIdLibrary.toId(key);
        s.uniswapV4Data.pools[poolId] = key;
        
        // Use the unlock pattern for initialization
        s.uniswapV4Data.poolManager.initialize(key, sqrtPriceX96);
        
        (uint160 sqrtPriceX96After, int24 tick, , , , , ) = s.uniswapV4Data.poolManager.getSlot0(poolId);
        emit UniswapV4PoolInitialized(poolId, sqrtPriceX96After, tick);
    }

    /**
    * @dev This function updates the Uniswap V4 pool data after a swap.
    * @param key The PoolKey of the pool.
    * @param sqrtPriceX96 The new sqrt price of the pool.
    * @param tick The new tick of the pool.
    * @param liquidity The new liquidity of the pool.
    */
    function updateUniswapV4PoolData(AppStorage storage s, PoolKey memory key, uint160 sqrtPriceX96, int24 tick, uint128 liquidity) internal {
        bytes32 poolId = PoolIdLibrary.toId(key);
        // We don't need to update the pool key as it's immutable
        // Just emit the event with updated data
        emit UniswapV4PoolUpdated(poolId, sqrtPriceX96, tick, liquidity);
    }

    /**
    * @dev This function sets the state of the bazaar.
    * @param newState The new state of the bazaar.
    */
    function setState(AppStorage storage s, BazaarState newState) internal {
        s.bazaarState = newState;
        emit StateChanged(newState);
    }

    /**
    * @dev This function returns the absolute value of an integer.
    * @param x The integer to get the absolute value of.
    * @return The absolute value of the integer.
    */
    function abs(int256 x) internal pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }

    /**
    * @dev This function returns the pre-order of a Steez.
    * @param creatorId The ID of the creator.
    * @return The pre-order of the Steez.
    */
    function getSteezPreOrder(AppStorage storage s, string memory creatorId) internal view returns (SteezPreOrder storage) {
        return s.bazaarData.steezPreOrders[creatorId];
    }

    /**
    * @dev This function returns the launch of a Steez.
    * @param creatorId The ID of the creator.
    * @return The launch of the Steez.
    */
    function getSteezLaunch(AppStorage storage s, string memory creatorId) internal view returns (SteezLaunch storage) {
        return s.bazaarData.steezLaunches[creatorId];
    }

    /**
    * @dev This function returns the anniversary of a Steez.
    * @param creatorId The ID of the creator.
    * @return The anniversary of the Steez.
    */
    function getSteezAnniversary(AppStorage storage s, string memory creatorId) internal view returns (SteezAnniversary storage) {
        return s.bazaarData.steezAnniversaries[creatorId];
    }

    /**
    * @dev This function sets the bid of a Steez pre-order.
    * @param creatorId The ID of the creator.
    * @param bidder The address of the bidder.
    * @param bid The bid to set.
    */
    function setPreOrderBid(AppStorage storage s, string memory creatorId, address bidder, Bid memory bid) internal{
        s.bazaarData.steezPreOrders[creatorId].bids[bidder] = bid;
    }

    /**
    * @dev This function returns the identity of a creator.
    * @param creatorId The ID of the creator.
    * @return The identity of the creator.
    */
    function getCreator(AppStorage storage s, string memory creatorId) internal view returns (Creator storage) {
        return s.creators[creatorId];
    }

    /**
    * @dev This function returns the start time of a Steez launch.
    * @param creatorId The ID of the creator.
    * @return The start time of the Steez launch.
    */
    function getLaunchStartTime(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezLaunches[creatorId].startTime;
    }

    /**
    * @dev This function sets the launch of a Steez.
    * @param creatorId The ID of the creator.
    * @param launch The launch to set.
    */
    function setLaunch(AppStorage storage s, string memory creatorId, SteezLaunch memory launch) internal{
        s.bazaarData.steezLaunches[creatorId] = launch;
    }

    /**
    * @dev This function returns the current floor price of a Steez pre-order.
    * @param creatorId The ID of the creator.
    * @return The current floor price of the Steez pre-order.
    */
    function getPreOrderCurrentFloorPrice(AppStorage storage s, string memory creatorId) view returns (uint256) {
        return s.bazaarData.steezPreOrders[creatorId].currentPrice;
    }

    /**
    * @dev This function returns the final price of a Steez launch.
    * @param creatorId The ID of the creator.
    * @return The final price of the Steez launch.
    */
    function getLaunchFinalPrice(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezLaunches[creatorId].currentPrice;
    }

    /**
    * @dev This function returns the investor of a Steez pre-order.
    * @param creatorId The ID of the creator.
    * @return The investor of the Steez pre-order.
    */
    function getPreOrderInvestor(AppStorage storage s, string memory creatorId) internal view returns (address) {
        return s.bazaarData.steezPreOrders[creatorId].investor;
    }

    /**
    * @dev This function returns the start time of a Steez anniversary.
    * @param creatorId The ID of the creator.
    * @return The start time of the Steez anniversary.
    */
    function getAnniversaryDate(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezAnniversaries[creatorId].startTime;
    }

    /**
    * @dev This function sets the anniversary of a Steez.
    * @param creatorId The ID of the creator.
    * @param anniversary The anniversary to set.
    */
    function setAnniversary(AppStorage storage s, string memory creatorId, SteezAnniversary memory anniversary) internal{
        s.bazaarData.steezAnniversaries[creatorId] = anniversary;
    }

    /**
    * @dev This function returns the final price of a Steez anniversary.
    * @param creatorId The ID of the creator.
    * @return The final price of the Steez anniversary.
    */
    function getAnniversaryFinalPrice(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezAnniversaries[creatorId].currentPrice;
    }

    /**
    * @dev This function returns the token count of a Steez launch.
    * @param creatorId The ID of the creator.
    * @return The token count of the Steez launch.
    */
    function getLaunchTokenCount(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezLaunches[creatorId].tokenCount;
    }
    
    /**
    * @dev This function returns the transaction count of a Steez.
    * @param creatorId The ID of the creator.
    * @return The transaction count of the Steez.
    */
    function getSteezTransactionCount(AppStorage storage s, string memory creatorId) internal view returns (uint256) {
        return s.bazaarData.steezTransactionCounts[creatorId];
    }
    
    /**
    * @dev This function sets the P2P trades of a Steez to be frozen.
    * @param creatorId The ID of the creator.
    * @param frozen Whether the P2P trades of the Steez should be frozen.
    */
    function setP2PTradesFrozen(AppStorage storage s, string memory creatorId, bool frozen) internal{
        s.bazaarData.steezOrderBooksFrozen[creatorId] = frozen;
    }

    /**
    * @dev This function cancels all active limit orders of a Steez.
    * @param creatorId The ID of the creator.
    */
    function cancelActiveLimitOrders(AppStorage storage s, string memory creatorId) internal{
        delete s.bazaarData.activeLimitOrders[creatorId];
    }

    /**
    * @dev This function returns the creator of a Steez.
    * @param creatorId The ID of the creator.
    * @return The creator of the Steez.
    */
    function getCreator(AppStorage storage s, string memory creatorId) internal view returns (Creator storage) {
        return s.creators[creatorId];
    }

    /**
    * @dev This function sets the finalized bid of a Steez pre-order.
    * @param creatorId The ID of the creator.
    * @param bidder The address of the bidder.
    * @param finalized Whether the bid is finalized.
    */
    function setPreOrderFinalizedBid(AppStorage storage s, string memory creatorId, address bidder, bool finalized) {
        s.bazaarData.steezPreOrders[creatorId].finalizedBids[bidder] = finalized;
    }

    /**
    * @dev This function cancels all active limit orders of a Steez.
    * @param creatorId The ID of the creator.
    */
    function cancelAllActiveLimitOrders(AppStorage storage s, string memory creatorId) {
        delete s.bazaarData.activeLimitOrders[creatorId];
    }
}

library AppConstants { // update all constants to use CAPITALIZED_NAME_CONVENTION
    // Steelo Constants
    string constant STEELO_NAME = "Steelo";
    string constant STEELO_SYMBOL = "STLO";
    uint256 constant TGE_AMOUNT = 825_000_000 * 10 ** 18; // 825 million STLO
    uint256 constant STEELO_INITIAL_PRICE = 5 * 10 ** 15; // 0.005 STLO represented in wei
    uint256 constant DECIMAL = 18;
    uint256 constant PERCENTAGE_PRECISION = 10000; // For percentage calculations
        /* TGE Distribution Rates */
        uint256 constant TREASURY_TGE = 350_000; // 35% - use PERCENTAGE_PRECISION in functions
        uint256 constant FOUNDERS_TGE = 200_000; // 20% - use PERCENTAGE_PRECISION in functions
        uint256 constant COMMUNITY_TGE = 350_000; // 35% - use PERCENTAGE_PRECISION in functions
        uint256 constant EARLY_INVESTORS_TGE = 100_000; // 10% - use PERCENTAGE_PRECISION in functions
        /* Mint Distribution Rates */
        uint256 constant TREASURY_MINT = 350_000; // 35% - use PERCENTAGE_PRECISION in functions
        uint256 constant LIQUIDITY_PROVIDERS_MINT = 550_000; // 55% - use PERCENTAGE_PRECISION in functions
        uint256 constant ECOSYSTEM_PROVIDERS_MINT = 100_000; // 10% - use PERCENTAGE_PRECISION in functions

    /* Mint Rates */
    uint256 constant P_MIN = 500_000 * 10 ** 12; // 0.5 STLO Scaled by 10^12
    uint256 constant P_MAX = 5_000_000 * 10 ** 12; // 5 STLO Scaled by 10^12
    uint256 constant RHO = 1_000_000 * 10 ** 12; // 1 STLO Scaled by 10^12
    uint256 constant ALPHA = 10_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant BETA = 10_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant DELTA = 10_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant MIN_MINT_RATE = 0; // 0% - use PERCENTAGE_PRECISION in functions
    uint256 constant MAX_MINT_RATE = 10_000; // 10% - use PERCENTAGE_PRECISION in functions

    /* Burn Rates */
    uint256 constant MIN_BURN_RATE = 0; // 0% - use PERCENTAGE_PRECISION in functions
    uint256 constant MAX_BURN_RATE = 10_000; // 10% - use PERCENTAGE_PRECISION in functions

    /* Addresses - to be updated */
    address constant TREASURY = 0xCBdA6Eb94AB60D30052AD37d686c544aDAFb69c3; // to be updated
    address constant LIQUIDITY_PROVIDERS = 0x04b73c5f0Df6FB740aF42D543081B71FE2759046; // to be updated
    address constant ECOSYSTEM_PROVIDERS = 0x4AB4fc11D7b7E7b0a5b6cA711C9E347C3ab608fA; // to be updated
    address constant FOUNDERS = 0xe235089F9AF881a164668EF824a8aDa50d2FB4A2; // to be updated
    address constant EARLY_INVESTORS_ADDRESS = 0xBa6fA29eabBbeD700434A831B03673B678CD3f8A; // to be updated
    address constant COMMUNITY_ADDRESS = 0x3e016bF4313c01Cb138cc879803b48A813752EC9; // to be updated

    // Steez Constants
    string constant STEEZ_NAME = "Steez";
    string constant STEEZ_SYMBOL = "STZ";
    uint256 constant MAX_CREATOR_TOKENS = 5_000;
    uint256 constant TRANSACTION_LIMIT_STEEZ = 10;
    uint256 constant STEEZ_PER_PERSON_LIMIT = 5;
    uint256 constant INITIAL_STEEZ_PRICE_CENT = 15; // 15 cents
    uint256 constant TOKENS_AFTER_PREORDER = 250; // Pre-Order Mint Amount
    uint256 constant EXTRA_TOKENS_AFTER_AUCTION = 250; // Launch Mint Amount
    uint256 constant ANNIVERSARY_TOKEN_COUNT = 500; // Anniversary Mint Amount

    // Bazaar Constants
    /* Pre-Order Distribution Rates */
        uint256 constant PRE_ORDER_CREATOR_ROYALTY = 900_000; // 90% - use PERCENTAGE_PRECISION in functions
        uint256 constant PRE_ORDER_STEELO_ROYALTY = 100_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant PRE_ORDER_DURATION = 24 hours;
    uint256 constant PRE_ORDER_SUPPLY = 500; // 5% - use PERCENTAGE_PRECISION in functions
    uint256 constant PRE_ORDER_INITIAL_PRICE = 30 ether; // 30 STLO
    uint256 constant PRE_ORDER_PRICE_INCREMENT = 10 ether; // 10 STLO

    /* Launch Distribution Rates */
        uint256 constant LAUNCH_CREATOR_ROYALTY = 900_000; // 90% - use PERCENTAGE_PRECISION in functions
        uint256 constant LAUNCH_STEELO_ROYALTY = 750_500; // 75% - use PERCENTAGE_PRECISION in functions
        uint256 constant LAUNCH_COMMUNITY_ROYALTY = 200_500; // 25% - use PERCENTAGE_PRECISION in functions
    uint256 constant LAUNCH_INITIAL_PRICE_INCREASE = 75; // 0.075% - use PERCENTAGE_PRECISION in functions
    uint256 constant LAUNCH_PRICE_INCREASE_DURATION = 15 minutes;
    uint256 constant LAUNCH_PRICE_DECREASE_DURATION = 105 minutes; // 1 hour 45 minutes
    uint256 constant LAUNCH_PRICE_RESET_DURATION = 120 minutes; // 2 hours

    /* Anniversary Distribution Rates */
        uint256 constant ANNIVERSARY_CREATOR_ROYALTY = 900_000; // 90% - use PERCENTAGE_PRECISION in functions
        uint256 constant ANNIVERSARY_STEELO_ROYALTY = 75_000; // 7.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant ANNIVERSARY_COMMUNITY_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions
    uint256 constant ANNIVERSARY_INITIAL_PRICE_INCREASE = 25; // 0.025% - use PERCENTAGE_PRECISION in functions
    uint256 constant ANNIVERSARY_PRICE_INCREASE_DURATION = 15 minutes;
    uint256 constant ANNIVERSARY_PRICE_DECREASE_DURATION = 105 minutes; // 1 hour 45 minutes
    uint256 constant ANNIVERSARY_PRICE_RESET_DURATION = 120 minutes; // 2 hours

    /* OrderBook (P2P) */
        uint256 constant P2P_SELLER_ROYALTY = 900_000; // 90% - use PERCENTAGE_PRECISION in functions
        uint256 constant P2P_CREATOR_ROYALTY = 50_000; // 5% - use PERCENTAGE_PRECISION in functions
        uint256 constant P2P_STEELO_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant P2P_INVESTOR_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions
    uint256 constant MAX_DAILY_TRANSACTION_AMOUNT = 1_000 * 1e18;

    /* SteezForSteez */
        uint256 constant STEEZ_FOR_STEEZ_CREATOR_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant STEEZ_FOR_STEEZ_STEELO_ROYALTY = 15_000; // 1.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant STEEZ_FOR_STEEZ_INVESTOR_ROYALTY = 10_000; // 1% - use PERCENTAGE_PRECISION in functions

    /* Content Trades */
        uint256 constant CONTENT_TRADE_CREATOR_ROYALTY = 50_000; // 5% - use PERCENTAGE_PRECISION in functions
        uint256 constant CONTENT_TRADE_STEELO_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant CONTENT_TRADE_INVESTOR_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions

    /* Content Auctions */
        uint256 constant CONTENT_AUCTION_CREATOR_ROYALTY = 900_000; // 90% - use PERCENTAGE_PRECISION in functions
        uint256 constant CONTENT_AUCTION_STEELO_ROYALTY = 75_000; // 7.5% - use PERCENTAGE_PRECISION in functions
        uint256 constant CONTENT_AUCTION_INVESTOR_ROYALTY = 25_000; // 2.5% - use PERCENTAGE_PRECISION in functions

    /* uniswap Misc. */
    uint256 public constant INITIAL_PRICE = 1e18; // 1 STLO
    uint256 public constant PRICE_MULTIPLIER = 1e6;
    uint256 public constant PRICE_DIVIDER = 1e6;
    uint256 public constant MAX_PRICE_CHANGE_PERCENTAGE = 100_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 public constant MAX_VOLUME_MULTIPLIER = 5; // 5x average volume

    // Village Constants
    string constant SIP_STATUS_ON_VOTE = "onVote";
    string constant SIP_STATUS_APPROVED = "approved";
    string constant SIP_STATUS_DECLINED = "declined";

    // Profile Constants
    string constant EXECUTIVE_ROLE = "EXECUTIVE_ROLE";
    string constant ADMIN_ROLE = "ADMIN_ROLE";
    string constant EMPLOYEE_ROLE = "EMPLOYEE_ROLE";
    string constant TESTER_ROLE = "TESTER_ROLE";
    string constant STAKER_ROLE = "STAKER_ROLE";
    string constant USER_ROLE = "USER_ROLE";
    string constant VISITOR_ROLE = "VISITOR_ROLE";
    string constant CREATOR_ROLE = "CREATOR_ROLE";
    string constant TEAM_ROLE = "TEAM_ROLE";
    string constant MODERATOR_ROLE = "MODERATOR_ROLE";
    string constant COLLABORATOR_ROLE = "COLLABORATOR_ROLE";
    string constant INVESTOR_ROLE = "INVESTOR_ROLE";
    string constant SUBSCRIBER_ROLE = "SUBSCRIBER_ROLE";

    // Miscellaneous Constants
    // General Constants
    string constant AUTHORS = "Edmund, Ravi, Ezra, Malcom";
    uint256 constant _NOT_ENTERED = 1;
    uint256 constant _ENTERED = 2;
    uint256 constant TRANSACTION_LIMIT = 1_000;
    uint256 constant LOW_RATE = 10_000; // 1% - use PERCENTAGE_PRECISION in functions
    uint256 constant MODERATE_RATE = 100_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant HIGH_RATE = 1_000_000; // 100% - use PERCENTAGE_PRECISION in functions
    uint256 constant ADJUSTEMENT_FACTOR_INITIAL = (10 ** 6); // 1.0
    uint256 constant LOW_RATE_VALUE = 10_000; // 1% - use PERCENTAGE_PRECISION in functions
    uint256 constant MODERATE_RATE_VALUE = 50_000; // 5% - use PERCENTAGE_PRECISION in functions
    uint256 constant HIGH_RATE_VALUE = 100_000; // 10% - use PERCENTAGE_PRECISION in functions
    uint256 constant MAX_UNSTAKERS_LENGTH = 5;
    uint256 constant SALT_NONCE = 1_000;

    // Time-related Constants
    uint256 constant ONE_YEAR = 365 days;
    uint256 constant ONE_MONTH = 30 days;
    uint256 constant ONE_WEEK = 7 days;
    uint256 constant ONE_DAY = 24 hours;
    uint256 constant ONE_HOUR = 60 minutes;

    // Status Constants
    string constant STATUS_NOT_INITIATED = "Not Initiated";
    string constant STATUS_INACTIVE = "Inactive";
    string constant STATUS_PRE_ORDER = "PreOrder";
    string constant STATUS_LAUNCH = "Launch";
    string constant STATUS_P2P = "P2P";
    string constant STATUS_ANNIVERSARY = "Anniversary";
    string constant STATUS_STEEZ_FOR_STEEZ = "SteezForSteez";
    string constant STATUS_CONTENT_TRADE = "ContentTrade";
    string constant STATUS_CONTENT_AUCTION = "ContentAuction";
}
