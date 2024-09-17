// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibSteelo } from "../libraries/LibSteelo.sol";
import { AppConstants } from "../libraries/LibAppStorage.sol";

/**
 * @title STEELOAttributesFacet
 * @dev This contract manages the attributes and token operations of the Steelo platform,
 *      including viewing metadata and performing minting and burning of Steelo tokens.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various functions to interact with Steelo token attributes
 *         and to perform token-related operations.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibDiamond: Supports the Diamond Standard for modularity.
 * - LibSteelo: Manages the core functionality related to burning and minting tokens.
 * 
 * Events:
 * - SteeloBurned: Emitted when Steelo tokens are burned.
 * - SteeloMinted: Emitted when Steelo tokens are minted.
 */
contract STEELOAttributesFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when Steelo tokens are burned.
     * @param account The account that burned the tokens.
     * @param amount The amount of tokens burned.
     */
    event SteeloBurned(address indexed account, uint256 amount);

    /**
     * @dev Emitted when Steelo tokens are minted.
     * @param account The account that minted the tokens.
     * @param amount The amount of tokens minted.
     */
    event SteeloMinted(address indexed account, uint256 amount);

    /**
     * @dev Returns the authors of the contract.
     * @return The authors of the contract.
     */
    function authors() public view returns (string memory) {
        return AppConstants.AUTHORS;
    }

    /**
     * @dev Returns the name of the Steelo token.
     * @return The name of the Steelo token.
     */
    function steeloName() public view returns (string memory) {
        return s.name;
    }

    /**
     * @dev Returns the symbol of the Steelo token.
     * @return The symbol of the Steelo token.
     */
    function steeloSymbol() public view returns (string memory) {
        return s.symbol;
    }

    /**
     * @dev Returns the decimal precision of the Steelo token.
     * @return The decimal precision of the Steelo token.
     */
    function steeloDecimal() public view returns (uint256) {
        return AppConstants.DECIMAL;
    }

    /**
     * @dev Returns the total supply of Steelo tokens.
     * @return The total supply of Steelo tokens.
     */
    function steeloTotalSupply() public view returns (uint256) {
        return s.totalSupply;
    }

    /**
     * @dev Returns the total number of tokens generated at the token generation event (TGE).
     * @return The total number of tokens generated at TGE.
     */
    function steeloTotalTokens() public view returns (uint256) {
        return AppConstants.TGE_AMOUNT;
    }

    /**
     * @dev Burns a specified amount of Steelo tokens from the caller's account.
     * Emits a {SteeloBurned} event.
     * @param amount The amount of tokens to burn.
     * @return A boolean indicating if the burn was successful.
     */
    function steeloBurn(uint256 amount) public returns (bool) {
        amount = amount * AppConstants.STEELO_DEMICALS;
        LibSteelo.burn(msg.sender, amount);
        emit SteeloBurned(msg.sender, amount);
        return true;
    }

    /**
     * @dev Mints a specified amount of Steelo tokens to the caller's account.
     * Emits a {SteeloMinted} event.
     * @param amount The amount of tokens to mint.
     * @return A boolean indicating if the mint was successful.
     */
    function steeloMint(uint256 amount) public returns (bool) {
        amount = amount * AppConstants.STEELO_DEMICALS;
        LibSteelo.mint(msg.sender, amount);
        emit SteeloMinted(msg.sender, amount);
        return true;
    }

    /**
     * @dev Returns the total number of transactions made in the Steelo ecosystem.
     * @return The total transaction count.
     */
    function getTotalTransactionAmount() public view returns (int256) {
        return s.totalTransactionCount;
    }
}
