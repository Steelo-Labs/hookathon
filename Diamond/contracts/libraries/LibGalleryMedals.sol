// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LibAppStorage.sol";
import "./LibSteelo.sol";
import "./LibBazaarRouter.sol";

library LibGalleryMedals {
    using LibAppStorage for LibAppStorage.AppStorage;

    event MedalAwarded(address indexed user, uint8 indexed medalType, uint8 tier, uint256 tokenId, uint256 airdropAmount);
    event MedalProgressUpdated(address indexed user, uint8 indexed medalType, uint128 progress);
    event MedalRebalanceTriggered(address indexed user, uint256 totalVolume, uint256 numTrades);

    /**
     * @dev This function checks and awards medals based on the user's accumulated activity.
     * The rebalancing threshold is defined in LibAppStorage.
     */
    function checkAndAwardMedals(
        LibAppStorage.AppStorage storage s, 
        address user, 
        uint256 totalVolume, 
        uint256 numTrades
    ) internal {
        // Iterate through all relevant medals and update progress
        for (uint8 i = 0; i < uint8(type(LibAppStorage.MedalType).max); i++) {
            updateMedalProgress(s, user, LibAppStorage.MedalType(i), calculateProgress(s, user, LibAppStorage.MedalType(i), totalVolume, numTrades));
        }
    }

    /**
     * @dev Updates medal progress and awards medals if necessary.
     */
    function updateMedalProgress(
        LibAppStorage.AppStorage storage s, 
        address user, 
        LibAppStorage.MedalType medalType, 
        uint128 newProgress
    ) internal {
        LibAppStorage.Medal storage medal = s.userMedals[user][uint8(medalType)];
        LibAppStorage.MedalCriteria storage criteria = s.medalCriteria[uint8(medalType)];

        // Apply decay to existing progress (if any)
        applyDecay(medal, criteria);

        if (newProgress > medal.progress) {
            medal.progress = newProgress;
            medal.lastUpdateTimestamp = uint32(block.timestamp);

            uint8 newTier = calculateTier(criteria, newProgress);
            if (newTier > medal.tier) {
                // Mint the medal as an NFT
                uint256 tokenId = s.medalNFT.mint(user);
                uint256 airdropAmount = newTier * LibAppStorage.AppConstants.BASE_MEDAL_AIRDROP;
                
                // Mint Steelo as a reward
                LibSteelo.mint(user, airdropAmount);

                medal.tier = newTier;
                emit MedalAwarded(user, uint8(medalType), newTier, tokenId, airdropAmount);
            }

            emit MedalProgressUpdated(user, uint8(medalType), newProgress);
        }
    }

    /**
     * @dev Rebalances medals after user activity crosses defined thresholds.
     * This function is triggered when the user activity threshold is reached or an external call is made to trigger a rebalance.
     */
    function rebalanceMedals(LibAppStorage.AppStorage storage s, address user) internal {
        uint256 totalVolume = s.userActivity[user].totalVolume;
        uint256 numTrades = s.userActivity[user].numTrades;

        // Check if the user meets the rebalance condition (defined by thresholds)
        if (totalVolume >= s.thresholds.volumeThreshold || numTrades >= s.thresholds.tradeThreshold) {
            checkAndAwardMedals(s, user, totalVolume, numTrades);

            // Reset user activity after rebalance
            s.userActivity[user].totalVolume = 0;
            s.userActivity[user].numTrades = 0;

            emit MedalRebalanceTriggered(user, totalVolume, numTrades);
        }
    }

    /**
     * @dev Applies decay to the progress of medals over time.
     * This ensures that medals are harder to maintain over time unless the user remains active.
     */
    function applyDecay(
        LibAppStorage.Medal storage medal, 
        LibAppStorage.MedalCriteria storage criteria
    ) internal {
        // Decay logic, based on time since the last update
        uint32 timeSinceLastUpdate = uint32(block.timestamp) - medal.lastUpdateTimestamp;
        if (timeSinceLastUpdate > criteria.decayRate) {
            // Apply decay proportional to the time elapsed
            uint128 decayAmount = (timeSinceLastUpdate / criteria.decayRate) * criteria.decayFactor;
            if (medal.progress > decayAmount) {
                medal.progress -= decayAmount;
            } else {
                medal.progress = 0;
            }
        }
    }
    
    /**
     * @dev Calculates the medal tier based on progress.
     */
    function calculateTier(
        LibAppStorage.MedalCriteria storage criteria, 
        uint128 progress
    ) internal view returns (uint8) {
        // Calculate the new tier based on progress and criteria
        for (uint8 tier = criteria.maxTier; tier > 0; tier--) {
            if (progress >= criteria.tierThresholds[tier]) {
                return tier;
            }
        }
        return 0;
    }

    /**
     * @dev Calculates progress towards a medal based on user activity.
     * This is a custom function that calculates progress based on total volume and number of trades.
     */
    function calculateProgress(
        LibAppStorage.AppStorage storage s,
        address user,
        LibAppStorage.MedalType medalType,
        uint256 totalVolume,
        uint256 numTrades
    ) internal view returns (uint128) {
        // Custom progress calculation logic depending on medal type
        LibAppStorage.MedalCriteria storage criteria = s.medalCriteria[uint8(medalType)];
        
        uint128 progress = 0;
        
        switch (medalType) {
            case LibAppStorage.MedalType.EarliestInvestor:
                progress = calculateEarliestInvestorProgress(s, user);
                break;
            case LibAppStorage.MedalType.TopReferrer:
                progress = calculateTopReferrerProgress(s, user);
                break;
            case LibAppStorage.MedalType.HighVolumeTrader:
                progress = uint128(totalVolume / criteria.volumeThreshold);
                break;
            case LibAppStorage.MedalType.HighestLiquidity:
                progress = calculateHighestLiquidityProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostProfitableTrader:
                progress = calculateMostProfitableTraderProgress(s, user);
                break;
            case LibAppStorage.MedalType.TopStaker:
                progress = calculateTopStakerProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostActiveCreator:
                progress = uint128(numTrades / criteria.tradeThreshold);
                break;
            case LibAppStorage.MedalType.BiggestContentCollector:
                progress = calculateBiggestContentCollectorProgress(s, user);
                break;
            case LibAppStorage.MedalType.BiggestNetwork:
                progress = calculateBiggestNetworkProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostDiversePortfolio:
                progress = calculateMostDiversePortfolioProgress(s, user);
                break;
            case LibAppStorage.MedalType.LongestHoldTime:
                progress = calculateLongestHoldTimeProgress(s, user);
                break;
            case LibAppStorage.MedalType.BestPredictions:
                progress = calculateBestPredictionsProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostInnovativeCreator:
                progress = calculateMostInnovativeCreatorProgress(s, user);
                break;
            case LibAppStorage.MedalType.HighestEngagement:
                progress = calculateHighestEngagementProgress(s, user);
                break;
            case LibAppStorage.MedalType.BestCommunityBuilder:
                progress = calculateBestCommunityBuilderProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostConsistentTrader:
                progress = calculateMostConsistentTraderProgress(s, user);
                break;
            case LibAppStorage.MedalType.HighestQualityContent:
                progress = calculateHighestQualityContentProgress(s, user);
                break;
            case LibAppStorage.MedalType.FastestGrowing:
                progress = calculateFastestGrowingProgress(s, user);
                break;
            case LibAppStorage.MedalType.MostResilient:
                progress = calculateMostResilientProgress(s, user);
                break;
            case LibAppStorage.MedalType.TopContributor:
                progress = calculateTopContributorProgress(s, user);
                break;
            default:
                revert("Invalid medal type");
        }
        
        return progress;
    }
    
    // 1
    /**
     * @dev Calculates the progress for the Earliest Investor medal.
     * This medal is awarded to the user who made their first investment the earliest.
     */
    function calculateEarliestInvestorProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Ensure there is at least one investment
        if (s.steeloDailyTotalInvestments[user].length == 0) return 0;

        // Get the timestamp of the user's first recorded investment
        uint256 firstInvestmentTime = s.steeloDailyTotalInvestments[user][0].timestamp;
        
        // Time elapsed since the first investment
        uint256 timeSinceFirstInvestment = block.timestamp - firstInvestmentTime;

        // Progress is measured as the amount of time the user has been an investor
        return uint128(timeSinceFirstInvestment);
    }

    // 2
    /**
     * @dev Calculates the progress for the Top Referrer medal.
     * This medal is awarded to the user who has successfully referred the most users to the platform.
     */
    function calculateTopReferrerProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Directly return the count of successful referrals for the user
        return uint128(s.referralCounts[user]);
    }

    // 3
    /**
     * @dev Calculates the progress for the High Volume Trader medal.
     * This medal is awarded to the user who has made the highest trading volume on the platform.
     */
    function calculateHighVolumeTraderProgress(LibAppStorage.AppStorage storage s, address user, BalanceDelta delta) internal view returns (uint128) {
        // Calculate the total volume by adding the previous trading volume to the new volume delta
        uint256 totalVolume = s.userTradingVolume[user] + LibBazaarRouter.calculateVolume(delta);

        // Return the total trading volume as progress
        return uint128(totalVolume);
    }

    // 4
    /**
     * @dev Calculates the progress for the Highest Liquidity medal.
     * This medal is awarded to the user who has provided the highest liquidity to the platform.
     */
    function calculateHighestLiquidityProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        uint256 totalLiquidity = 0;

        // Iterate through all creator IDs and sum the user's liquidity across all creators
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            string memory creatorId = s.allCreatorIds[i];

            // Get the user's liquidity position for each creator
            (uint256 liquidity,,) = LibBazaarRouter.getLiquidityPosition(creatorId, user);

            // Add the liquidity amount to the total
            totalLiquidity += liquidity;
        }

        // Return the total liquidity provided by the user
        return uint128(totalLiquidity);
    }

    // 5
    /**
     * @dev Calculates the progress for the Most Profitable Trader medal.
     * This medal is awarded to the user who has made the most profit from trading on the platform.
     */
    function calculateMostProfitableTraderProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        int256 totalProfit = 0;

        // Iterate through all creators and calculate the user's total profits across all creators
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            string memory creatorId = s.allCreatorIds[i];
            totalProfit += s.userProfits[user][creatorId];
        }

        // Return the total profits as progress, ensuring it's non-negative
        return totalProfit > 0 ? uint128(uint256(totalProfit)) : 0;
    }

    // 6
    /**
     * @dev Calculates the progress for the Top Staker medal.
     * This medal is awarded to the user who has staked the highest amount of Steelo.
     */
    function calculateTopStakerProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Directly return the amount the user has staked
        return uint128(s.stakers[user].amount);
    }

    // 7
    /**
     * @dev Calculates the progress for the Most Active Creator medal.
     * This medal is awarded to the user who has created the most content on the platform.
     */
    function calculateMostActiveCreatorProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Check if the user is a creator by verifying their creator identity
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length == 0) return 0;

        // Return the number of items in the creator's collection
        return uint128(s.creatorCollections[creatorId].length);
    }

    // 8
    /**
     * @dev Calculates the progress for the Biggest Content Collector medal.
     * This medal is awarded to the user who has collected the most content from creators on the platform.
     */
    function calculateBiggestContentCollectorProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        uint256 totalCollected = 0;

        // Iterate through all creators and sum the content the user has collected from each one
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            string memory creatorId = s.allCreatorIds[i];

            // Sum the collected content for each creator
            totalCollected += s.userCollectedContent[user][creatorId].length;
        }

        // Return the total number of collected content items
        return uint128(totalCollected);
    }

    // 9
    /**
     * @dev Calculates the progress for the Biggest Network medal.
     * This medal is awarded to the user who has the largest network of followers and following on the platform.
     */
    function calculateBiggestNetworkProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Return the sum of the user's followers and those they are following
        return uint128(s.userFollowers[user].length + s.userFollowing[user].length);
    }

    // 10
    /**
     * @dev Calculates the progress for the Most Diverse Portfolio medal.
     * This medal is awarded to the user who has made the most unique trades across different creators on the platform.
     */
    function calculateMostDiversePortfolioProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Directly use the utility function to count the unique trades made by the user
        uint256 count = 0;
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            if (s.hasUserTradedSteez[user][s.allCreatorIds[i]]) {
                count++;
            }
        }
        return uint128(count);
    }

    // 11
    /**
     * @dev Calculates the progress for the Longest Hold Time medal.
     * This medal is awarded to the user who has held the longest position in any asset on the platform.
     */
    function calculateLongestHoldTimeProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        uint256 longestHoldTime = 0;

        // Iterate through all creators and find the longest hold time
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            string memory creatorId = s.allCreatorIds[i];
            uint256 holdTime = s.userHoldTimes[user][creatorId];

            // Check if the current hold time is the longest
            if (holdTime > longestHoldTime) {
                longestHoldTime = holdTime;
            }
        }

        // Return the longest hold time as progress
        return uint128(longestHoldTime);
    }

    // 12
    /**
     * @dev Calculates the progress for the Best Predictions medal.
     * This medal is awarded to the user who has made the most accurate predictions on the platform.
     */
    function calculateBestPredictionsProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        uint256 totalCorrectPredictions = 0;
        uint256 totalPredictions = 0;

        // Sum up the user's total predictions and correct predictions
        for (uint256 i = 0; i < s.allCreatorIds.length; i++) {
            string memory creatorId = s.allCreatorIds[i];
            totalCorrectPredictions += s.userCorrectPredictions[user][creatorId];
            totalPredictions += s.userTotalPredictions[user][creatorId];
        }

        // If the user has made no predictions, return 0
        if (totalPredictions == 0) return 0;

        // Calculate the accuracy percentage and return it as progress
        return uint128((totalCorrectPredictions * 1e18) / totalPredictions);
    }

    // 13
    /**
     * @dev Calculates the progress for the Most Innovative Creator medal.
     * This medal is awarded to the user who has made the most innovative content on the platform.
     */
    function calculateMostInnovativeCreatorProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Check if the user is a creator by verifying their creator identity
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length == 0) return 0;

        // Return the innovation score associated with the creator
        return uint128(s.creatorInnovationScore[creatorId]);
    }

    // 14
    /**
     * @dev Calculates the progress for the Highest Engagement medal.
     * This medal is awarded to the user who has the highest engagement score on the platform.
     */
    function calculateHighestEngagementProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Check if the user is a creator by verifying their creator identity
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length == 0) return 0;

        // Return the engagement score for the creator
        return uint128(s.creatorEngagementScore[creatorId]);
    }

    // 15
    /**
     * @dev Calculates the progress for the Best Community Builder medal.
     * This medal is awarded to the user who has the highest community score on the platform.
     */
    function calculateBestCommunityBuilderProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Check if the user is a creator by verifying their creator identity
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length == 0) return 0;

        // Return the community score associated with the creator
        return uint128(s.creatorCommunityScore[creatorId]);
    }

    // 16
    /**
     * @dev Calculates the progress for the Most Consistent Trader medal.
     * This medal is awarded to the user who has made the most consistent trades on the platform.
     */
    function calculateMostConsistentTraderProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Directly return the consistency score for the user
        return uint128(s.userConsistencyScore[user]);
    }

    // 17
    /**
     * @dev Calculates the progress for the Highest Quality Content medal.
     * This medal is awarded to the user who has the highest quality content on the platform.
     */
    function calculateHighestQualityContentProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Check if the user is a creator by verifying their creator identity
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length == 0) return 0;

        // Return the content quality score associated with the creator
        return uint128(s.creatorContentQualityScore[creatorId]);
    }

    // 18
    /**
     * @dev Calculates the progress for the Fastest Growing medal.
     * This medal is awarded to the user who has the fastest growing follower count on the platform.
     */
    function calculateFastestGrowingProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Return the user’s follower growth rate as progress
        return uint128(s.userGrowthRate[user]);
    }

    // 19
    /**
     * @dev Calculates the progress for the Most Resilient medal.
     * This medal is awarded to the user who has the highest resilience score on the platform.
     */
    function calculateMostResilientProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Return the user's resilience score as progress
        return uint128(s.userResilienceScore[user]);
    }

    // 20
    /**
     * @dev Calculates the progress for the Top Contributor medal.
     * This medal is awarded to the user who has made the most contributions to the platform.
     */
    function calculateTopContributorProgress(LibAppStorage.AppStorage storage s, address user) internal view returns (uint128) {
        // Get the user's trading volume
        uint128 tradingProgress = uint128(s.userTradingVolume[user]);

        // Get the user's staking amount
        uint128 stakingProgress = uint128(s.stakers[user].amount);

        // Check if the user is a creator and get their content creation progress
        uint128 contentProgress = 0;
        string memory creatorId = s.creatorIdentity[user];
        if (bytes(creatorId).length != 0) {
            contentProgress = uint128(s.creatorCollections[creatorId].length);
        }

        // Get the user's community score if they are a creator
        uint128 communityProgress = 0;
        if (bytes(creatorId).length != 0) {
            communityProgress = uint128(s.creatorCommunityScore[creatorId]);
        }

        // Return the average of all these metrics as the top contributor progress
        return (tradingProgress + stakingProgress + contentProgress + communityProgress) / 4;
    }
}