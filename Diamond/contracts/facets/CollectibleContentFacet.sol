// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import {LibSteez} from "../libraries/LibSteez.sol";
import {AppConstants} from "../libraries/LibAppStorage.sol";
import {Steez, Content} from "../libraries/LibAppStorage.sol";

/**
 * @title CollectibleContentFacet
 * @dev This contract manages the content creation and management functions for the Steelo platform,
 *      allowing users to create, delete, and view content.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various functionalities to interact with Steelo's content system,
 *         including creating and deleting content, as well as fetching content details.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibDiamond: Supports the Diamond Standard for modularity.
 * - LibSteez: Manages the core functionality related to content operations.
 * 
 * Events:
 * - ContentCreated: Emitted when content is created.
 * - ContentDeleted: Emitted when content is deleted.
 */
contract CollectibleContentFacet {
   
	AppStorage internal s;

	/**
	* @dev Emitted when content is created.
	* @param creator The address of the content creator.
	* @param videoId The ID of the video content.
	* @param exclusivity A boolean indicating if the content is exclusive.
	*/
	event ContentCreated(address indexed creator, string videoId, bool exclusivity);

	/**
	* @dev Emitted when content is deleted.
	* @param creator The address of the content creator.
	* @param videoId The ID of the video content.
	*/
	event ContentDeleted(address indexed creator, string videoId);
	
	/**
	* @dev Creates content and stores it in the contract's storage.
	* Emits a {ContentCreated} event.
	* @param videoId The ID of the video content.
	* @param exclusivity A boolean indicating if the content is exclusive.
	*/
	function createContent(string memory videoId, string memory name, string memory thumbnailUrl, string memory videoUrl, string memory description, bool exclusivity) public payable {		
		LibSteez.createContent(msg.sender, videoId, name, thumbnailUrl, videoUrl, description, exclusivity);
		emit ContentCreated(msg.sender, videoId, exclusivity);
	}

	/**
	* @dev Returns the details of a specific content by creator ID and video ID.
	* @param creatorId The ID of the creator.
	* @param videoId The ID of the video content.
	* @return The content details.
	*/
	function getOneCreatorContent(string memory creatorId, string memory videoId) public view returns (Content memory) {
		require(keccak256(abi.encodePacked(s.creators[creatorId].creatorId)) != keccak256(abi.encodePacked("")), "there is no creator account");
		return s.creatorContent[creatorId][videoId];	
	}

	/**
	* @dev Returns all contents created by a specific creator.
	* @param creatorId The ID of the creator.
	* @return An array of content created by the creator.
	*/
	function getAllCreatorContents(string memory creatorId) public view returns (Content[] memory) {
		require(keccak256(abi.encodePacked(s.creators[creatorId].creatorId)) != keccak256(abi.encodePacked("")), "there is no creator account");
		return s.creatorCollections[creatorId];	
	}

	/**
	* @dev Returns all contents stored in the contract.
	* @return An array of all content.
	*/
	function getAllContents() public view returns (Content[] memory) {
		return s.collections;	
	}

	/**
	* @dev Deletes a specific content by video ID.
	* Emits a {ContentDeleted} event.
	* @param videoId The ID of the video content to delete.
	*/
	function deleteContent(string memory videoId) public payable {		
		LibSteez.deleteContent(msg.sender, videoId);
		emit ContentDeleted(msg.sender, videoId);
	}

	/**
	* @dev Returns all investors for a specific creator.
	* @param creatorId The ID of the creator.
	* @return An array of investors for the creator.
	*/
	function getAllInvestors(string memory creatorId) public view returns(Investor[] memory) {
		return s.steez[creatorId].investors;
	}

	/**
	* @dev Adds a collaborator to a content.
	* @param creatorId The ID of the creator.
	* @param contentId The ID of the content.
	* @param collaboratorAddress The address of the collaborator.
	* @param collaboratorPercent The percentage of the collaborator.
	* @param collaboratorName The name of the collaborator.
	* @param profileUrl The profile URL of the collaborator.
	* @param collaboratorRole The role of the collaborator.
	*/
	function addCollaborator(string memory creatorId, string memory contentId, address collaboratorAddress, uint256 collaboratorPercent,string memory collaboratorName, string memory profileUrl, string memory collaboratorRole) public payable {
		LibSteez.addCollaborator( msg.sender, creatorId, contentId, collaboratorAddress, collaboratorPercent, collaboratorName, profileUrl, collaboratorRole );
	}
}