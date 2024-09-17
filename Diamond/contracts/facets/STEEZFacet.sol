// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibSteez} from "../libraries/LibSteez.sol";
import {AppConstants, Seller, Steez, Creator} from "../libraries/LibAppStorage.sol";
import {Steez, DailySteezPrice, DailySteeloInvestment, DailyTotalSteeloInvestment, Content} from "../libraries/LibAppStorage.sol";

/**
 * @title STEEZFacet
 * @dev This contract manages creator-related functions for the Steelo platform,
 *      including creating and deleting creators, initializing pre-orders, and handling P2P sales.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various functionalities to interact with Steelo's creator system,
 *         including creator management, token initialization, and peer-to-peer sales.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibSteez: Manages the core functionality related to creator operations.
 * 
 * Events:
 * - CreatorDeleted: Emitted when a creator is deleted.
 * - SteezCreated: Emitted when Steez tokens are created.
 * - PreOrderInitialized: Emitted when a pre-order is initialized.
 * - SteezInitiated: Emitted when Steez tokens are initiated.
 * - LaunchStarted: Emitted when a launch is started.
 * - AnniversaryStarted: Emitted when an anniversary is started.
 * - P2PSellInitiated: Emitted when a peer-to-peer sale is initiated.
 */
contract STEEZFacet {
   
	AppStorage internal s;

	/**
	* @dev Emitted when a creator is deleted.
	* @param deleter The address of the user deleting the creator.
	* @param profileId The profile ID of the creator being deleted.
	*/
	event CreatorDeleted(address indexed deleter, string profileId);

	/**
	* @dev Emitted when Steez tokens are created.
	* @param creator The address of the creator.
	*/
	event SteezCreated(address indexed creator);
	
	/**
	* @dev Emitted when Steez tokens are initiated.
	* @param initiator The address of the initiator.
	*/
	event SteezInitiated(address indexed initiator);

    /**
     * @dev Emitted when an approval decision is made.
     * @param approver The address of the user making the decision.
     * @param creatorId The ID of the creator.
     * @param answer The approval decision (true for accept, false for reject).
     */
    event ApprovalDecision(address indexed approver, string creatorId, bool answer);

    /**
     * @dev Accepts or rejects a creator's proposal.
     * Emits an {ApprovalDecision} event.
     * @param creatorId The ID of the creator.
     * @param answer The approval decision (true for accept, false for reject).
     */
    function AcceptOrReject(string memory creatorId, bool answer) public {
        LibSteez.AcceptOrReject(msg.sender, creatorId, answer);
        emit ApprovalDecision(msg.sender, creatorId, answer);
    }
	
	/**
	* @dev Deletes a creator profile.
	* Emits a {CreatorDeleted} event.
	* @param profileId The profile ID of the creator being deleted.
	*/	
	function deleteCreator(string memory profileId) public payable {		
		LibSteez.deleteCreator(msg.sender, profileId);
		emit CreatorDeleted(msg.sender, profileId);
	}

	/**
	* @dev Returns the total Steez transactions for a specific profile ID.
	* @param profileId The profile ID.
	* @return The total Steez transactions.
	*/
	function returnSteezTransaction(string memory profileId) public view returns (uint256) {
		return s.totalSteezTransaction[profileId];
	}

	/**
	* @dev Creates Steez tokens for the caller.
	* Emits a {SteezCreated} event.
	*/
	function createSteez( ) public {
		LibSteez.createSteez( msg.sender );
		emit SteezCreated(msg.sender);
	}

	/**
	* @dev Initiates Steez tokens for the caller.
	* Emits a {SteezInitiated} event.
	* @return success A boolean indicating if the initiation was successful.
	*/
	function steezInitiate () public returns (bool success) {
		LibSteez.initiate(msg.sender);
		emit SteezInitiated(msg.sender);
		return true;
	}

	/**
	* @dev Returns the name of the creator token.
	* @return The name of the creator token.
	*/
	function creatorTokenName () public view returns (string memory) {
		return s.creatorTokenName;
	}

	/**
	* @dev Returns the sellers for a specific creator.
	* @param creatorId The ID of the creator.
	* @return An array of sellers.
	*/
	function returnSellers(string memory creatorId) public view returns (Seller[] memory) {
		return s.sellers[creatorId];
	}

	/**
	* @dev Returns the percentage of the creator.
	* @param creatorId The ID of the creator.
	* @return The percentage of the creator.
	*/
	function getPercentage(string memory creatorId) public view returns (int256 ) {
		return ( s.steez[creatorId].percentage );
	}

	/**
	* @dev Returns the daily Steez price for a creator.
	* @param creatorId The ID of the creator.
	* @return An array of daily Steez price records.
	*/
	function getDailySteezPrice(string memory creatorId) public view returns (DailySteezPrice[] memory ) {
		return ( s.steez[creatorId].dailySteezPrices);
	}

	/**
	* @dev Returns the ROI for a creator.
	* @param creatorId The ID of the creator.
	* @param account The address of the account.
	* @return The ROI for the creator.
	*/
	function getROI(string memory creatorId, address account) public view returns (int ) {
//		require(s.steez[creatorId].SteeloInvestors[account] > 0, "you have not owned a steez of the creator");
//		require(s.steezInvested[account][creatorId] > 0, "you do not own any kind of steez");
		if (s.steez[creatorId].SteeloInvestors[account] > 0 && s.steezInvested[account][creatorId] > 0) {
			return ( int(s.steez[creatorId].currentPrice) - int(s.steez[creatorId].SteeloInvestors[account] / s.steezInvested[account][creatorId]) + int((s.steez[creatorId].SteeloInvestors[account] * s.steezInvested[account][creatorId] * AppConstants.INVESTOR_LAUNCH_PERCENTAGE_TEN_THOUSAND) /10000) );
		}
		else {
			return 0;
		}
	}

	/**
	* @dev Returns the daily Steelo investment for a creator.
	* @param creatorId The ID of the creator.
	* @param account The address of the account.
	* @return An array of daily Steelo investment records.
	*/
	function getDailySteeloInvestment(string memory creatorId, address account) public view returns (DailySteeloInvestment[] memory ) {
		return ( s.steez[creatorId].steeloDailyInvestments[account] );
	}

	/**
	* @dev Returns the total Steelo invested for a creator.
	* @param creatorId The ID of the creator.
	* @param account The address of the account.
	* @return The total Steelo invested for the creator.
	*/
	function getTotalSteeloInvested(string memory creatorId, address account) public view returns (uint256 ) {
		return ( s.totalSteeloInvested[account] );
	}

	/**
	* @dev Returns the daily total Steelo investment for a creator.
	* @param creatorId The ID of the creator.
	* @param account The address of the account.
	* @return An array of daily total Steelo investment records.
	*/
	function getDailyTotalSteeloInvestment(string memory creatorId, address account) public view returns (DailyTotalSteeloInvestment[] memory ) {
		return ( s.steeloDailyTotalInvestments[account] );
	}

	/**
	* @dev Returns the total Steeo percent for a creator.
	* @param creatorId The ID of the creator.
	* @param account The address of the account.
	* @return The total Steeo percent for the creator.
	*/
	function getTotalSteeoPercent(string memory creatorId, address account) public view returns (int ) {
		if (s.steeloDailyTotalInvestments[account].length > 1 && s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 2].steeloInvested != 0) {
			return ( ((int(s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 1].steeloInvested) - int(s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 2].steeloInvested)) * 100) /  ( int(s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 2].steeloInvested)));
		}
		else if ((s.steeloDailyTotalInvestments[account].length > 1 && s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 2].steeloInvested == 0) || s.steeloDailyTotalInvestments[account].length  == 1) {
			return int(s.steeloDailyTotalInvestments[account][s.steeloDailyTotalInvestments[account].length - 1].steeloInvested / (10 ** 16));
		}
		else {
			return 0; 
		}
	}

	/**
	* @dev Returns the collaborators for a content.
	* @param contentId The ID of the content.
	* @return An array of collaborators.
	*/
	function getContentCollaborators(string memory contentId) public view returns (Collaborator[] memory ) {
		return ( s.collaborators[contentId] );
	}
}
