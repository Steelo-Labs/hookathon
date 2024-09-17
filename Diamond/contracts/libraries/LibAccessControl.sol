// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LibAppStorage.sol";
import {AppConstants} from "./LibAppStorage.sol";

/**
 * @title LibAccessControl
 * @dev This library manages access control for the Steelo platform,
 *      including role initialization, granting, and revoking roles.
 * 
 * @notice The library provides functions to initialize the access control system,
 *         grant roles to users, and revoke roles from users.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * 
 * Constants:
 * - AppConstants: Provides constants for various roles.
 */
library LibAccessControl {
    /**
     * @dev Initializes the access control system with the specified owner.
     * @param owner The address of the owner to initialize with executive and all other roles.
     */
    function initialize(address owner) internal {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(!s.accessInitialized, "executive already available && access control already initialized");
        s.roles[owner] = AppConstants.EXECUTIVE_ROLE;
        s.executiveMembers[owner] = true;
        s.adminMembers[owner] = true;
        s.employeeMembers[owner] = true;
        s.testerMembers[owner] = true;
        s.userMembers[owner] = true;
        s.visitorMembers[owner] = true;
        s.teamMembers[owner] = true;
        s.moderatorMembers[owner] = true;
        s.subscriberMembers[owner] = true;
        s.accessInitialized = true;
    }

    /**
     * @dev Grants a role to the specified account.
     * @param granter The address of the granter, must have executive role.
     * @param role The role to be granted.
     * @param account The address of the account to grant the role to.
     */
    function grantRole(address granter, string memory role, address account) internal {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.executiveMembers[granter] == true, "only executive has the power to grant roles");
        require(granter != account, "can not grant role to oneself");
        s.roles[account] = role;
        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EXECUTIVE_ROLE))) {
            s.executiveMembers[account] = true;
            s.adminMembers[account] = true;
            s.employeeMembers[account] = true;
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.teamMembers[account] = true;
            s.moderatorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.ADMIN_ROLE))) {
            s.adminMembers[account] = true;
            s.employeeMembers[account] = true;
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.teamMembers[account] = true;
            s.moderatorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TEAM_ROLE))) {
            s.employeeMembers[account] = true;
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.teamMembers[account] = true;
            s.moderatorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.MODERATOR_ROLE))) {
            s.employeeMembers[account] = true;
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.moderatorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.CREATOR_ROLE))) {
            s.visitorMembers[account] = true;
            s.creatorMembers[account] = true;
            s.collaboratorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.COLLABORATOR_ROLE))) {
            s.collaboratorMembers[account] = true;
            s.visitorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.INVESTOR_ROLE))) {
            s.visitorMembers[account] = true;
            s.investorMembers[account] = true;
            s.stakerMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.STAKER_ROLE))) {
            s.stakerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EMPLOYEE_ROLE))) {
            s.employeeMembers[account] = true;
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TESTER_ROLE))) {
            s.testerMembers[account] = true;
            s.visitorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.SUBSCRIBER_ROLE))) {
            s.visitorMembers[account] = true;
            s.subscriberMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.USER_ROLE))) {
            s.visitorMembers[account] = true;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.VISITOR_ROLE))) {
            s.visitorMembers[account] = true;
        }
    }

    /**
     * @dev Revokes a role from the specified account.
     * @param revoker The address of the revoker, must have executive role.
     * @param role The role to be revoked.
     * @param account The address of the account to revoke the role from.
     */
    function revokeRole(address revoker, string memory role, address account) internal {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.executiveMembers[revoker] == true, "only executive has the power to grant roles");
        require(revoker != account, "can not grant role to oneself");
        require(keccak256(bytes(s.roles[account])) != keccak256(bytes("")), "account has no role");
        string memory newRole;
        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EXECUTIVE_ROLE))) {
            newRole = AppConstants.ADMIN_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.ADMIN_ROLE))) {
            newRole = AppConstants.TEAM_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TEAM_ROLE))) {
            newRole = AppConstants.MODERATOR_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.MODERATOR_ROLE))) {
            newRole = AppConstants.EMPLOYEE_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EMPLOYEE_ROLE))) {
            newRole = AppConstants.TESTER_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TESTER_ROLE))) {
            newRole = AppConstants.USER_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.CREATOR_ROLE))) {
            newRole = AppConstants.COLLABORATOR_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.COLLABORATOR_ROLE))) {
            newRole = AppConstants.INVESTOR_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.INVESTOR_ROLE))) {
            newRole = AppConstants.STAKER_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.STAKER_ROLE))) {
            newRole = AppConstants.SUBSCRIBER_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.SUBSCRIBER_ROLE))) {
            newRole = AppConstants.USER_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.USER_ROLE))) {
            newRole = AppConstants.VISITOR_ROLE;
        } else if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.VISITOR_ROLE))) {
            newRole = "";
        }

        s.roles[account] = newRole;
        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EXECUTIVE_ROLE))) {
            s.executiveMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.ADMIN_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TEAM_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.teamMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.MODERATOR_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.teamMembers[account] = false;
            s.moderatorMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.CREATOR_ROLE))) {
            s.creatorMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.COLLABORATOR_ROLE))) {
            s.creatorMembers[account] = false;
            s.collaboratorMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.INVESTOR_ROLE))) {
            s.creatorMembers[account] = false;
            s.collaboratorMembers[account] = false;
            s.investorMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.STAKER_ROLE))) {
            s.creatorMembers[account] = false;
            s.collaboratorMembers[account] = false;
            s.investorMembers[account] = false;    
            s.stakerMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.EMPLOYEE_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.teamMembers[account] = false;
            s.moderatorMembers[account] = false;
            s.employeeMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.TESTER_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.teamMembers[account] = false;
            s.moderatorMembers[account] = false;
            s.employeeMembers[account] = false;
            s.testerMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.SUBSCRIBER_ROLE))) {
            s.creatorMembers[account] = false;
            s.collaboratorMembers[account] = false;
            s.investorMembers[account] = false;    
            s.stakerMembers[account] = false;
            s.subscriberMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.USER_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.employeeMembers[account] = false;
            s.testerMembers[account] = false;
            s.stakerMembers[account] = false;
            s.userMembers[account] = false;
            s.creatorMembers[account] = false;
            s.teamMembers[account] = false;
            s.collaboratorMembers[account] = false;
            s.investorMembers[account] = false;
            s.moderatorMembers[account] = false;
            s.subscriberMembers[account] = false;
        }

        if (keccak256(bytes(role)) == keccak256(bytes(AppConstants.VISITOR_ROLE))) {
            s.executiveMembers[account] = false;
            s.adminMembers[account] = false;
            s.employeeMembers[account] = false;
            s.testerMembers[account] = false;
            s.stakerMembers[account] = false;
            s.userMembers[account] = false;
            s.visitorMembers[account] = false;
            s.creatorMembers[account] = false;
            s.teamMembers[account] = false;
            s.collaboratorMembers[account] = false;
            s.investorMembers[account] = false;
            s.moderatorMembers[account] = false;
            s.subscriberMembers[account] = false;
        }
    }
}