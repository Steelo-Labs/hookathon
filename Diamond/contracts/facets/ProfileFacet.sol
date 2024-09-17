// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibSteelo } from "../libraries/LibSteelo.sol";
import { AppConstants } from "../libraries/LibAppStorage.sol";

/**
 * @title ProfileFacet
 * @dev This contract manages user accounts and profiles in the Steelo ecosystem.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract facilitates the creation and deletion of Steelo user accounts,
 *         as well as providing information about user profiles and statuses.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibDiamond: Supports the Diamond Standard for modularity.
 * - LibSteelo: Manages the creation and deletion of Steelo users.
 * 
 * Events:
 * - SteeloUserCreated: Emitted when a new Steelo user is created.
 * - SteeloUserDeleted: Emitted when a Steelo user is deleted.
 */
contract ProfileFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when a new Steelo user is created.
     * @param user The address of the new user.
     * @param profileId The profile ID of the new user.
     */
    event SteeloUserCreated(address indexed user, string profileId);

    /**
     * @dev Emitted when a Steelo user is deleted.
     * @param user The address of the deleted user.
     */
    event SteeloUserDeleted(address indexed user);

    /**
     * @dev Returns the current price of Steelo.
     * @return The current price of Steelo.
     */
    function steeloPrice() public view returns (uint256) {
        return s.steeloCurrentPrice;    
    }

    /**
     * @dev Creates a new Steelo user.
     * Emits a {SteeloUserCreated} event.
     * @param profileId The profile ID of the new user.
     */
    function createSteeloUser(string memory profileId) public {
        LibSteelo.createSteeloUser(msg.sender, profileId);
        emit SteeloUserCreated(msg.sender, profileId);
    }

    /**
     * @dev Deletes the calling Steelo user.
     * Emits a {SteeloUserDeleted} event.
     */
    function deleteSteeloUser() public {
        LibSteelo.deleteSteeloUser(msg.sender);
        emit SteeloUserDeleted(msg.sender);
    }

    /**
     * @dev Returns the status of a Steez by creator ID.
     * @param creatorId The ID of the creator.
     * @return The status of the Steez.
     */
    function steezStatus(string memory creatorId) public view returns (string memory) {
        return s.steez[creatorId].status;
    }

    /**
     * @dev Returns the profile ID of the calling user.
     * @return The profile ID of the user.
     */
    function profileIdUser(address account) public view returns (string memory) {
        return s.userAlias[account];
    }

    /**
     * @dev Returns the profile ID of the calling creator.
     * @return The profile ID of the creator.
     */
    function profileIdCreator(address account) public view returns (string memory) {
        return s.creatorIdentity[account];
    }

    /**
     * @dev Checks if the calling user is an executive member.
     * @return A boolean indicating if the user is an executive member.
     */
    function isExecutive(address account) public view returns (bool) {
        return s.executiveMembers[account];
    }
}