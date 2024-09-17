// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibSteez} from "../libraries/LibSteez.sol";
import {AppConstants, Seller, Steez, Creator} from "../libraries/LibAppStorage.sol";

/**
 * @title STEEZDataBaseFacet
 * @dev This contract manages the database functions for the Steelo platform,
 *      including creating creators, checking pre-order statuses, and retrieving creator data.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various functionalities to interact with Steelo's database system,
 *         including creator management, pre-order status checks, and data retrieval.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibSteez: Manages the core functionality related to database operations.
 * 
 * Events:
 * - CreatorCreated: Emitted when a creator is created.
 * - PreOrderEnded: Emitted when a pre-order period ends.
 */
contract STEEZDataBaseFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when a creator is created.
     * @param creator The address of the creator.
     * @param profileId The profile ID of the creator.
     */
    event CreatorCreated(address indexed creator, string profileId);
    
    /**
     * @dev Emitted when a pre-order period ends.
     * @param creatorId The ID of the creator.
     */
    event PreOrderEnded(string creatorId);

    /**
     * @dev Creates a new creator profile.
     * Emits a {CreatorCreated} event.
     * @param profileId The profile ID of the creator.
     */
    function createCreator(string memory profileId) public payable {        
        LibSteez.createCreator(msg.sender, profileId);
        emit CreatorCreated(msg.sender, profileId);
    }

    /**
     * @dev Checks the pre-order status of a creator.
     * @param creatorId The ID of the creator.
     * @param account The account to check the status for.
     * @return A tuple containing pre-order status details.
     */
    function checkPreOrderStatus(string memory creatorId, address account) public view returns (uint256, uint256, uint256, uint256, uint256) {
        return (
            s.steez[creatorId].SteeloInvestors[account],
            s.balances[account],
            s.steez[creatorId].totalSteeloPreOrder,
            s.steezInvested[account][creatorId],
            s.steez[creatorId].liquidityPool
        );
    }

    /**
     * @dev Returns the first and last investment amounts for a creator.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the first and last investment amounts.
     */
    function FirstAndLast(string memory creatorId) public view returns (uint256, uint256) {
        if (s.steez[creatorId].investors.length > 0) {
            return (s.steez[creatorId].investors[0].steeloInvested, s.steez[creatorId].investors[s.steez[creatorId].investors.length - 1].steeloInvested);
        }
        else {
            return (0, 0);
        }
    }

    /**
     * @dev Returns detailed information about a creator by their ID.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the creator details, current price, and number of investors.
     */
    function getCreatorWithId(string memory creatorId) public view returns (Creator memory, uint256, uint256) {
        return (s.creators[creatorId], s.steez[creatorId].currentPrice, s.steez[creatorId].investors.length);
    }

    /**
     * @dev Returns all creators' data.
     * @return An array of Steez containing all creators' data.
     */
    function getAllCreatorsData() public view returns (Steez[] memory) {
        return (s.allCreators);
    }

    /**
     * @dev Returns basic information about a creator by their ID.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the creator's address, total supply, and current price.
     */
    function getAllCreator(string memory creatorId) public view returns (address, uint256, uint256) {
        return (s.steez[creatorId].creatorAddress, s.steez[creatorId].totalSupply, s.steez[creatorId].currentPrice);
    }

    /**
     * @dev Returns additional information about a creator by their ID.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the auction start time, anniversary date, and auction conclusion status.
     */
    function getAllCreator2(string memory creatorId) public view returns (uint256, uint256, bool) {
        return (s.steez[creatorId].auctionStartTime, s.steez[creatorId].anniversaryDate, s.steez[creatorId].auctionConcluded);
    }

    /**
     * @dev Returns pre-order related information about a creator by their ID.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the pre-order start time, liquidity pool amount, and pre-order started status.
     */
    function getAllCreator3(string memory creatorId) public view returns (uint256, uint256, bool) {
        return (s.steez[creatorId].preOrderStartTime, s.steez[creatorId].liquidityPool, s.steez[creatorId].preOrderStarted);
    }

    /**
     * @dev Returns the number of investors for a specific creator.
     * @param creatorId The ID of the creator.
     * @return The number of investors.
     */
    function checkInvestorsLength(string memory creatorId) public view returns (uint256) {
        return s.steez[creatorId].investors.length;
    }

    /**
     * @dev Checks the details of the first investor for a specific creator.
     * @param creatorId The ID of the creator.
     * @return A tuple containing the number of investors, the first investor's amount invested and time invested, and the first investor's address.
     */
    function checkInvestors(string memory creatorId) public view returns (uint256, uint256, uint256, address) {
        return s.steez[creatorId].investors.length > 0
            ? (s.steez[creatorId].investors.length, 
               s.steez[creatorId].investors[0].steeloInvested, 
               s.steez[creatorId].investors[0].timeInvested, 
               s.steez[creatorId].investors[0].walletAddress)
            : (0, 0, 0, address(0));
    }
}
