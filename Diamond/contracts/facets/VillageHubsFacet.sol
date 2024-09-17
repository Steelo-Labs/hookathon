// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibVillage} from "../libraries/LibVillage.sol";
import {AppConstants, Message} from "../libraries/LibAppStorage.sol";

/**
 * @title VillageHubsFacet
 * @dev This contract manages messaging functions for the Steelo platform,
 *      allowing users to send, edit, and delete messages both in private and group chats.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides functionalities to interact with Steelo's messaging system,
 *         including private messages, group messages, and contact management.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibVillage: Manages the core functionality related to messaging operations.
 * 
 * Events:
 * - MessageSent: Emitted when a private message is sent.
 * - MessageDeleted: Emitted when a private message is deleted.
 * - MessageEdited: Emitted when a private message is edited.
 * - GroupMessagePosted: Emitted when a group message is posted.
 * - GroupMessageDeleted: Emitted when a group message is deleted.
 * - GroupMessageEdited: Emitted when a group message is edited.
 */
contract VillageHubsFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when a private message is sent.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param recipient The address of the recipient.
     * @param message The content of the message.
     */
    event MessageSent(string creatorId, address indexed sender, address indexed recipient, string message);
    
    /**
     * @dev Emitted when a private message is deleted.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param recipient The address of the recipient.
     * @param messageId The ID of the message.
     */
    event MessageDeleted(string creatorId, address indexed sender, address indexed recipient, uint256 messageId);
    
    /**
     * @dev Emitted when a private message is edited.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param recipient The address of the recipient.
     * @param messageId The ID of the message.
     * @param message The new content of the message.
     */
    event MessageEdited(string creatorId, address indexed sender, address indexed recipient, uint256 messageId, string message);

    /**
     * @dev Emitted when a group message is posted.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param message The content of the group message.
     */
    event GroupMessagePosted(string creatorId, address indexed sender, string message);

    /**
     * @dev Emitted when a group message is deleted.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param messageId The ID of the group message.
     */
    event GroupMessageDeleted(string creatorId, address indexed sender, uint256 messageId);

    /**
     * @dev Emitted when a group message is edited.
     * @param creatorId The ID of the creator.
     * @param sender The address of the sender.
     * @param messageId The ID of the group message.
     * @param message The new content of the group message.
     */
    event GroupMessageEdited(string creatorId, address indexed sender, uint256 messageId, string message);

    /**
     * @dev Sends a private message to a recipient.
     * Emits a {MessageSent} event.
     * @param creatorId The ID of the creator.
     * @param recipient The address of the recipient.
     * @param message The content of the message.
     */
    function sendMessage(string memory creatorId, address recipient, string memory message) public {
        LibVillage.sendMessage(creatorId, msg.sender, recipient, message);
        emit MessageSent(creatorId, msg.sender, recipient, message);
    }

    /**
     * @dev Retrieves the chat history between the caller and a recipient.
     * @param creatorId The ID of the creator.
     * @param recipient The address of the recipient.
     * @return Two arrays of messages, one for each direction of the chat.
     */
    function getChat(string memory creatorId, address recipient) public view returns (Message[] memory, Message[] memory) {
        return (
            s.p2pMessages[creatorId][msg.sender][recipient],
            s.p2pMessages[creatorId][recipient][msg.sender]
        );        
    }

    /**
     * @dev Retrieves the contacts of the caller for a specific creator.
     * @param creatorId The ID of the creator.
     * @return An array of addresses representing the contacts.
     */
    function getContacts(string memory creatorId) public view returns (address[] memory) {
        return s.contacts[creatorId][msg.sender];
    }

    /**
     * @dev Deletes a private message.
     * Emits a {MessageDeleted} event.
     * @param creatorId The ID of the creator.
     * @param recipient The address of the recipient.
     * @param messageId The ID of the message to delete.
     */
    function deleteMessage(string memory creatorId, address recipient, uint256 messageId) public {
        LibVillage.deleteMessage(creatorId, msg.sender, recipient, messageId);
        emit MessageDeleted(creatorId, msg.sender, recipient, messageId);
    }

    /**
     * @dev Edits a private message.
     * Emits a {MessageEdited} event.
     * @param creatorId The ID of the creator.
     * @param recipient The address of the recipient.
     * @param messageId The ID of the message to edit.
     * @param message The new content of the message.
     */
    function editMessage(string memory creatorId, address recipient, uint256 messageId, string memory message) public {
        LibVillage.editMessage(creatorId, msg.sender, recipient, messageId, message);
        emit MessageEdited(creatorId, msg.sender, recipient, messageId, message);
    }

    /**
     * @dev Posts a group message.
     * Emits a {GroupMessagePosted} event.
     * @param creatorId The ID of the creator.
     * @param message The content of the group message.
     */
    function postMessage(string memory creatorId, string memory message) public {
        LibVillage.postMessage(creatorId, msg.sender, message);
        emit GroupMessagePosted(creatorId, msg.sender, message);
    }

    /**
     * @dev Retrieves the group chat history for a specific creator.
     * @param creatorId The ID of the creator.
     * @return An array of group messages.
     */
    function getGroupChat(string memory creatorId) public view returns (Message[] memory) {
        return s.posts[creatorId];        
    }

    /**
     * @dev Deletes a group message.
     * Emits a {GroupMessageDeleted} event.
     * @param creatorId The ID of the creator.
     * @param messageId The ID of the group message to delete.
     */
    function deleteGroupMessage(string memory creatorId, uint256 messageId) public {
        LibVillage.deleteGroupMessage(creatorId, msg.sender, messageId);
        emit GroupMessageDeleted(creatorId, msg.sender, messageId);
    }

    /**
     * @dev Edits a group message.
     * Emits a {GroupMessageEdited} event.
     * @param creatorId The ID of the creator.
     * @param messageId The ID of the group message to edit.
     * @param message The new content of the group message.
     */
    function editGroupMessage(string memory creatorId, uint256 messageId, string memory message) public {
        LibVillage.editGroupMessage(creatorId, msg.sender, messageId, message);
        emit GroupMessageEdited(creatorId, msg.sender, messageId, message);
    }
}
