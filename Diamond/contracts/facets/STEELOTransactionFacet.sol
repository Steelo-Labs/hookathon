// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibSteelo } from "../libraries/LibSteelo.sol";
import { AppConstants } from "../libraries/LibAppStorage.sol";

/**
 * @title STEELOTransactionFacet
 * @dev This contract manages the transfer functions for the Steelo platform,
 *      allowing users to transfer tokens and perform transfer operations on behalf of others.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various transfer functionalities to interact with Steelo tokens,
 *         allowing users to transfer tokens and to authorize transfers.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibDiamond: Supports the Diamond Standard for modularity.
 * - LibSteelo: Manages the core functionality related to token transfers.
 * 
 * Events:
 * - Transfer: Emitted when tokens are transferred.
 * - TransferFrom: Emitted when tokens are transferred on behalf of another address.
 */
contract STEELOTransactionFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when tokens are transferred.
     * @param from The address from which the tokens are transferred.
     * @param to The address to which the tokens are transferred.
     * @param amount The amount of tokens transferred.
     */
    event Transfer(address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Emitted when tokens are transferred on behalf of another address.
     * @param operator The address performing the transfer.
     * @param from The address from which the tokens are transferred.
     * @param to The address to which the tokens are transferred.
     * @param amount The amount of tokens transferred.
     */
    event TransferFrom(address indexed operator, address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Transfers a specified amount of Steelo tokens to a given address.
     * Emits a {Transfer} event.
     * @param to The address to which the tokens are transferred.
     * @param amount The amount of tokens to transfer.
     * @return success A boolean indicating if the transfer was successful.
     */
    function steeloTransfer(address to, uint256 amount) public returns (bool) {
        LibSteelo.transfer(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Transfers a specified amount of Steelo tokens from one address to another on behalf of a third address.
     * Emits a {TransferFrom} event.
     * @param from The address from which the tokens are transferred.
     * @param to The address to which the tokens are transferred.
     * @param amount The amount of tokens to transfer.
     * @return success A boolean indicating if the transfer was successful.
     */
    function steeloTransferFrom(address from, address to, uint256 amount) public returns (bool) {
        LibSteelo.transferFrom(from, to, amount);
        emit TransferFrom(msg.sender, from, to, amount);
        return true;
    }
}
