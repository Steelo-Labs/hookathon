 // SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./LibAppStorage.sol";
import "./LibSteelo.sol";
import "./LibSteez.sol";
import "./LibBazaarRouter.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./LibGalleryMedals.sol";

/// @title LibBazaarHooks
/// @notice Library for Bazaar hooks and related functionality
library LibBazaarHooks {
    using LibAppStorage for LibAppStorage.AppStorage;

    // Events
    event MedalAwarded(address indexed user, string medalType, uint256 tokenId);
    event ReferralRewardDistributed(address indexed referrer, address indexed referee, uint256 amount);
    event StealthModeActivated(address indexed user);
    event FeeAdjusted(address indexed user, uint256 newFee);
    event StopLossTriggered(string indexed creatorId, address indexed user, uint256 triggerPrice);
    event TakeProfitTriggered(string indexed creatorId, address indexed user, uint256 triggerPrice);
    event ConditionalOrderExecuted(string indexed creatorId, address indexed user, uint256 amount, uint256 price);
    event ArbitrageAttemptDetected(address indexed user, string indexed creatorId, uint256 amount);
    event EmergencyStop(address indexed initiator);
    event EmergencyResumed(address indexed initiator);
    event MedalRebalanced(address indexed user, uint256 tradeVolume, uint256 numTrades);
    event GaslessRebalancingExecuted(string indexed creatorId, uint256 steeloAmount, uint256 creatorShare, uint256 steeloShare, uint256 investorShare);

    /**
     * @dev Calculates the hook flags based on which hooks are implemented.
     * @return flags The calculated hook flags
     */
    function calculateHookFlags() internal pure returns (uint8 flags) {
        // Set flags based on which hooks are implemented
        // flags |= 0x01; // beforeInitialize
        // flags |= 0x02; // afterInitialize
        flags |= 0x04; // beforeModifyPosition
        // flags |= 0x08; // afterModifyPosition
        flags |= 0x10; // beforeSwap
        flags |= 0x20; // afterSwap
        // flags |= 0x40; // beforeDonate
        // flags |= 0x80; // afterDonate

        // Note: Remove the flag if the corresponding hook is not implemented.
    }

    /**
     * @dev Calculates the salt for the hook address.
     * @return salt The calculated salt
     */
    function calculateHookSalt() internal pure returns (bytes32 salt) {
        // Calculate the salt based on the hook flags
        uint8 flags = calculateHookFlags();
        salt = keccak256(abi.encode(flags));
    }

    /**
     * @dev Calculates the hook address for the BazaarHookFacet contract.
     * @param deployer The address of the deployer
     * @return hookAddress The calculated hook address
     */
    function getHookAddress(address deployer) internal view returns (address hookAddress) {
        bytes32 salt = calculateHookSalt();
        bytes memory bytecode = type(BazaarHookFacet).creationCode;
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                deployer,
                salt,
                keccak256(bytecode)
            )
        );
        hookAddress = address(uint160(uint256(hash)));
    }

    /**
     * @dev Processes conditional orders for a creator.
     * This function checks if the current price meets the trigger price for conditional orders
     * and executes the orders accordingly.
     * @param s The AppStorage struct
     * @param creatorId The ID of the creator
     * @param sender The address of the sender
     * @param params The swap parameters
     */
    function processConditionalOrders(
        LibAppStorage.AppStorage storage s, 
        string memory creatorId, 
        address sender, 
        LibAppStorage.SwapParams memory params
    ) internal(s) {
        uint256 currentPrice = LibBazaarRouter.calculatePrice(creatorId);
        LibAppStorage.ConditionalOrder[] storage orders = s.conditionalOrders[creatorId][sender];

        for (uint256 i = 0; i < orders.length; i++) {
            LibAppStorage.ConditionalOrder storage order = orders[i];
            if (order.isStopLoss && currentPrice <= order.triggerPrice) {
                // Execute stop loss order
                LibBazaarRouter.createLimitOrder(creatorId, order.amount, order.triggerPrice, false);
                emit StopLossTriggered(creatorId, sender, order.triggerPrice);
                _removeConditionalOrder(orders, i);
                i--;
            } else if (!order.isStopLoss && currentPrice >= order.triggerPrice) {
                // Execute take profit order
                LibBazaarRouter.createLimitOrder(creatorId, order.amount, order.triggerPrice, false);
                emit TakeProfitTriggered(creatorId, sender, order.triggerPrice);
                _removeConditionalOrder(orders, i);
                i--;
            }
        }
    }

    /**
     * @dev Checks for potential arbitrage attempts.
     * This function implements a basic arbitrage detection mechanism.
     * @param s The AppStorage struct
     * @param creatorId The ID of the creator
     * @param sender The address of the sender
     * @param params The swap parameters
     */
    function checkArbitrageAttempt(
        LibAppStorage.AppStorage storage s, 
        string memory creatorId, 
        address sender, 
        LibAppStorage.SwapParams memory params
    ) internal(s) {
        uint256 currentPrice = LibBazaarRouter.calculatePrice(creatorId);
        uint256 twap = LibBazaarRouter.calculateTWAP(creatorId, 15 minutes);
        uint256 maxDeviation = (twap * 5) / 100; // 5% max deviation

        // Check if the current price deviates significantly from TWAP
        if (LibAppStorage.abs(int256(currentPrice) - int256(twap)) > int256(maxDeviation)) {
            uint256 volume = LibSteelo.calculateVolume(BalanceDelta(params.amountSpecified, 0));
            uint256 averageVolume = LibBazaarRouter.calculateAverageVolume(creatorId);

            // Check for volume spike
            if (volume > averageVolume * 3) { // Volume spike: 3x the average
                uint256 newFee = LibBazaarRouter.calculateDynamicFee(creatorId, volume, averageVolume);
                LibBazaarRouter.setPoolFee(creatorId, newFee);
                emit ArbitrageAttemptDetected(sender, creatorId, uint256(params.amountSpecified));
            }
        }
    }

    /**
     * @dev Processes conditional buy orders for a creator.
     * This function checks if the current price meets the trigger price for conditional buy orders
     * and executes the orders accordingly.
     * @param s The AppStorage struct
     * @param creatorId The ID of the creator
     * @param sender The address of the sender
     * @param params The swap parameters
     */
    function processConditionalBuyOrders(
        LibAppStorage.AppStorage storage s, 
        string memory creatorId, 
        address sender, 
        LibAppStorage.SwapParams memory params
    ) internal(s) {
        uint256 currentPrice = LibBazaarRouter.calculatePrice(creatorId);
        LibAppStorage.ConditionalBuyOrder[] storage buyOrders = s.conditionalBuyOrders[creatorId][sender];

        for (uint256 i = 0; i < buyOrders.length; i++) {
            LibAppStorage.ConditionalBuyOrder storage order = buyOrders[i];
            if (currentPrice <= order.triggerPrice) {
                // Execute conditional buy order
                uint256 amountOut = LibBazaarRouter.swapExactOutput(
                    creatorId,
                    order.amount,
                    order.triggerPrice,
                    sender,
                    order.additionalPayment
                );
                emit ConditionalOrderExecuted(creatorId, sender, order.amount, amountOut);
                _removeConditionalBuyOrder(buyOrders, i);
                i--;
            }
        }
    }

    /**
     * @dev Processes referral rewards for a user.
     * This function calculates and distributes referral rewards to the referrer.
     * @param s The AppStorage struct
     * @param sender The address of the sender
     */
    function processReferralReward(LibAppStorage.AppStorage storage s, address sender) internal(s) {
        address referrer = s.profiles[sender].referrer;
        if (referrer != address(0)) {
            uint256 rewardAmount = LibSteelo.calculateReferralReward(sender);
            require(rewardAmount > 0, "Invalid reward amount");
            LibSteelo.mint(referrer, rewardAmount);
            s.referrals[referrer].push(sender);
            emit ReferralRewardDistributed(referrer, sender, rewardAmount);
        }
    }

    /**
     * @dev Applies stealth mode to a swap.
     * This function randomizes the swap amount for users in stealth mode.
     * @param s The AppStorage struct
     * @param sender The address of the sender
     * @param key The pool key
     * @param params The swap parameters
     */
    function applyStealthMode(
        LibAppStorage.AppStorage storage s, 
        address sender, 
        PoolKey calldata key, 
        LibAppStorage.SwapParams memory params
    ) internal(s) {
        if (s.profiles[sender].stealthMode) {
            params.amountSpecified = _randomizeAmount(params.amountSpecified, 100);
            emit StealthModeActivated(sender);
        }
    }

    /**
     * @dev Adjusts the fee based on the volume of trades.
     * This function adjusts the fee based on the volume of trades for a user.
     * @param s The AppStorage struct
     * @param sender The address of the sender
     * @param delta The balance delta
     */
    function adjustFeeBasedOnVolume(LibAppStorage.AppStorage storage s, address sender, BalanceDelta delta) internal(s) {
        uint256 volume = LibSteelo.calculateVolume(delta);
        uint256 newFee;

        if (volume < LibAppStorage.AppConstants.LOW_VOLUME_THRESHOLD) {
            newFee = LibAppStorage.AppConstants.LOW_VOLUME_FEE;
        } else if (volume > LibAppStorage.AppConstants.HIGH_VOLUME_THRESHOLD) {
            newFee = LibAppStorage.AppConstants.HIGH_VOLUME_FEE;
        } else {
            newFee = LibAppStorage.AppConstants.STANDARD_FEE;
        }

        s.userFees[sender] = newFee;
        emit FeeAdjusted(sender, newFee);
    }









    /**
     * @dev Accumulates user activity for medal rebalancing.
     * This function accumulates the total volume and number of trades for a user.
     * @param s The AppStorage struct
     * @param user The address of the user
     * @param tradeVolume The volume of trades
     * @param numTrades The number of trades
     */
    function accumulateUserActivity(
        LibAppStorage.AppStorage storage s, 
        address user, 
        uint256 tradeVolume, 
        uint256 numTrades
    ) internal {
        // Accumulate user activity
        s.userActivity[user].totalVolume += tradeVolume;
        s.userActivity[user].numTrades += numTrades;
    }

    /**
     * @dev Rebalances the medals for a user based on their accumulated activity.
     * This function checks if the user meets the rebalance condition and awards medals accordingly.
     * It also resets the accumulated activity after rebalancing.
     * @param s The AppStorage struct
     * @param user The address of the user to rebalance medals for
     */
    function rebalanceMedals(
        LibAppStorage.AppStorage storage s, 
        address user
    ) internal {
        uint256 totalVolume = s.userActivity[user].totalVolume;
        uint256 numTrades = s.userActivity[user].numTrades;

        // Check if the user meets the rebalance condition
        if (totalVolume >= s.thresholds.volumeThreshold || numTrades >= s.thresholds.tradeThreshold) {
            // Award medals based on accumulated activity
            LibGalleryMedals.checkAndAwardMedals(s, user, totalVolume, numTrades);

            // Reset accumulated activity
            s.userActivity[user].totalVolume = 0;
            s.userActivity[user].numTrades = 0;

            emit MedalRebalanced(user, totalVolume, numTrades);
        }
    }

    /**
     * @dev Awards a medal to a user.
     * This function awards a medal to a user based on their tier.
     * @param s The AppStorage struct
     * @param user The address of the user
     * @param medalType The type of medal
     * @param tier The tier of the medal
     */
    function _awardMedal(LibAppStorage.AppStorage storage s, address user, string memory medalType, uint256 tier) internal {
        require(user != address(0), "Invalid user address");
        require(bytes(medalType).length > 0, "Invalid medal type");
        require(tier > 0 && tier <= 5, "Invalid medal tier");
        require(!s.paused, "Contract is paused");

        // Check if the user already has this medal at this tier or higher
        if (s.userMedals[user][medalType] >= tier) {
            return;
        }

        // Mint a new medal NFT
        uint256 tokenId = s.medalNFT.mint(user);
        
        // Update the user's medal status
        s.userMedals[user][medalType] = tier;

        // Calculate airdrop amount based on tier
        uint256 airdropAmount = tier * LibAppStorage.AppConstants.BASE_MEDAL_AIRDROP;

        // Perform airdrop
        LibSteelo.mint(user, airdropAmount);

        // Emit an event for the awarded medal
        emit MedalAwarded(user, medalType, tier, tokenId, airdropAmount);
    }




    /**
     * @dev Stops the contract in case of an emergency.
     * This function allows the admin to stop all state-changing operations.
     * @param s The AppStorage struct
     */
    function emergencyStop(LibAppStorage.AppStorage storage s) internal(s) {
        s.paused = true;
        emit EmergencyStop(msg.sender);
    }

    /**
     * @dev Resumes the contract after an emergency stop.
     * This function allows the admin to resume all state-changing operations.
     * @param s The AppStorage struct
     */
    function emergencyResume(LibAppStorage.AppStorage storage s) internal(s) {
        s.paused = false;
        emit EmergencyResumed(msg.sender);
    }

    /**
     * @dev Randomizes an amount within a given factor.
     * This function adds a small random variation to the input amount.
     * @param amount The original amount
     * @param randomizationFactor The factor for randomization
     * @return The randomized amount
     */
    function _randomizeAmount(int256 amount, uint256 randomizationFactor) internal view returns (int256) {
        int256 randomization = int256(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % randomizationFactor) - int256(randomizationFactor / 2);
        return amount + (amount * randomization) / 10000; // Randomize by ±0.5%
    }

    /**
     * @dev Removes a conditional order from the array.
     * This function removes a conditional order at the specified index from the array.
     * @param orders The array of conditional orders
     * @param index The index of the order to remove
     */
    function _removeConditionalOrder(LibAppStorage.ConditionalOrder[] storage orders, uint256 index) internal {
        require(index < orders.length, "Invalid index");
        orders[index] = orders[orders.length - 1];
        orders.pop();
    }

    /**
     * @dev Removes a conditional buy order from the array.
     * This function removes a conditional buy order at the specified index from the array.
     * @param orders The array of conditional buy orders
     * @param index The index of the order to remove
     */
    function _removeConditionalBuyOrder(LibAppStorage.ConditionalBuyOrder[] storage orders, uint256 index) internal {
        require(index < orders.length, "Invalid index");
        orders[index] = orders[orders.length - 1];
        orders.pop();
    }

    /**
     * @dev Verifies the contract state.
     * This function verifies the contract state to ensure all critical components are set and operational.
     * @param s The AppStorage struct
     */
    function _verifyContractState(LibAppStorage.AppStorage storage s) internal view {
        require(!s.paused, "Contract is paused");
        require(s.medalNFT != address(0), "Medal NFT contract not set");
        require(s.topStakerThreshold > 0, "Invalid top staker threshold");
        require(s.mostActiveCreatorThreshold > 0, "Invalid most active creator threshold");
        require(s.biggestContentCollectorThreshold > 0, "Invalid biggest content collector threshold");
        require(s.biggestNetworkThreshold > 0, "Invalid biggest network threshold");
        // Add more state checks as needed
    }

    /**
     * @dev Distributes value without requiring gas from the user
     * @param creatorId The ID of the creator
     * @param steeloAmount The total amount of value to distribute
     * @param state The current state of the Bazaar
     */
    function _gaslessRebalancing(
        LibAppStorage.AppStorage storage s,
        string memory creatorId,
        uint256 steeloAmount,
        LibAppStorage.BazaarState state
    ) internal nonReentrant {
        if (bytes(creatorId).length == 0) revert InvalidCreatorId();
        if (steeloAmount == 0) revert InvalidSteeloAmount();
        if (state == LibAppStorage.BazaarState.SteeloRebalanced) revert InvalidBazaarState();

        LibAppStorage.SteeloPool storage steeloPool = s.bazaarData.steeloPools[creatorId];
        if (steeloPool.investors.length == 0) revert NoInvestorsRegistered();
        
        uint256 creatorShare;
        uint256 steeloShare;
        uint256 investorShare;

        if (state == LibAppStorage.BazaarState.PreOrder) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.PRE_ORDER_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.PRE_ORDER_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.Launch) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.LAUNCH_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.LAUNCH_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.LAUNCH_COMMUNITY_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.Anniversary) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.ANNIVERSARY_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.ANNIVERSARY_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.ANNIVERSARY_COMMUNITY_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.P2P) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.P2P_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.P2P_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.P2P_INVESTOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.SteezForSteez) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.STEEZ_FOR_STEEZ_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.STEEZ_FOR_STEEZ_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.STEEZ_FOR_STEEZ_INVESTOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.ContentTrade) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_TRADE_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_TRADE_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_TRADE_INVESTOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else if (state == LibAppStorage.BazaarState.ContentAuction) {
            creatorShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_AUCTION_CREATOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            steeloShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_AUCTION_STEELO_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
            investorShare = (steeloAmount * LibAppStorage.AppConstants.CONTENT_AUCTION_INVESTOR_ROYALTY) / LibAppStorage.AppConstants.PERCENTAGE_PRECISION;
        } else {
            revert InvalidBazaarState();
        }

        if (creatorShare + steeloShare + investorShare != steeloAmount) revert InvalidFeeDistribution();

        steeloPool.creatorBalance = steeloPool.creatorBalance.add(creatorShare);
        steeloPool.steeloBalance = steeloPool.steeloBalance.add(steeloShare);
        steeloPool.totalInvestorShares = steeloPool.totalInvestorShares.add(investorShare);

        uint256 totalInvestorShares = steeloPool.totalInvestorShares;
        if (totalInvestorShares > 0) {
            uint256 distributedShares = 0;
            uint256 investorsLength = steeloPool.investors.length;
            for (uint256 i = 0; i < investorsLength; ++i) {
                address investor = steeloPool.investors[i];
                if (investor == address(0)) revert InvalidInvestorAddress();
                uint256 investorBalance = steeloPool.investorBalances[investor];
                uint256 newShare = (investorShare * investorBalance) / totalInvestorShares;
                steeloPool.investorBalances[investor] = steeloPool.investorBalances[investor].add(newShare);
                distributedShares = distributedShares.add(newShare);
            }
            if (distributedShares != investorShare) revert InvestorShareDistributionError();
        }

        emit GaslessRebalancingExecuted(creatorId, steeloAmount, creatorShare, steeloShare, investorShare);
        setState(LibAppStorage.BazaarState.SteeloRebalanced);
    }
}