// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibAccessControl} from "../libraries/LibAccessControl.sol";
import {AppConstants, Message} from "../libraries/LibAppStorage.sol";

/**
 * @title AccessControlFacet
 * @dev This contract implements the access control mechanisms for the application.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract manages role-based access control, allowing for role assignment and revocation.
 *         It is a crucial part of the Steelo ecosystem, ensuring that only authorized addresses can perform certain actions.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibAccessControl: Manages the initialization, role assignment, and role revocation logic.
 */
contract AccessControlFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when the contract is initialized.
     * @param initializer The address that initializes the contract.
     */
    event Initialized(address indexed initializer);

    /**
     * @dev Emitted when a role is granted to an account.
     * @param role The role that is granted.
     * @param account The account that is granted the role.
     * @param sender The address that grants the role.
     */
    event RoleGranted(string indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when a role is revoked from an account.
     * @param role The role that is revoked.
     * @param account The account that is revoked the role.
     * @param sender The address that revokes the role.
     */
    event RoleRevoked(string indexed role, address indexed account, address indexed sender);

    /**
     * @dev Initializes the contract, setting the message sender as the initial administrator.
     * Emits an {Initialized} event.
     */
    function initialize() public {
        LibAccessControl.initialize(msg.sender);
        emit Initialized(msg.sender);
    }

    /**
     * @dev Returns the role assigned to the message sender.
     * @return The role assigned to the message sender.
     */
    function getRole(address account) public view returns (string memory) {
        return s.roles[account];
    }

    /**
     * @dev Assigns a specified role to an account.
     * Emits a {RoleGranted} event.
     * @param role The role to assign.
     * @param account The account to be assigned the role.
     */
    function grantRole(string memory role, address account) public {
        LibAccessControl.grantRole(msg.sender, role, account);
        emit RoleGranted(role, account, msg.sender);
    }

    /**
     * @dev Revokes a specified role from an account.
     * Emits a {RoleRevoked} event.
     * @param role The role to revoke.
     * @param account The account to be revoked the role.
     */
    function revokeRole(string memory role, address account) public {
        LibAccessControl.revokeRole(msg.sender, role, account);
        emit RoleRevoked(role, account, msg.sender);
    }
}
