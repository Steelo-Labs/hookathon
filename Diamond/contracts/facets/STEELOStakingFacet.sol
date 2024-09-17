// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibSteelo } from "../libraries/LibSteelo.sol";
import { AppConstants } from "../libraries/LibAppStorage.sol";

/**
 * @title STEELOStakingFacet
 * @dev This contract manages the staking functions for the Steelo platform,
 *      including token minting, staking, and unstaking operations.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various staking functionalities to interact with Steelo tokens,
 *         allowing users to stake and unstake tokens, and to check balances and allowances.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibDiamond: Supports the Diamond Standard for modularity.
 * - LibSteelo: Manages the core functionality related to token operations and staking.
 * 
 * Events:
 * - TokensMinted: Emitted when tokens are minted.
 * - SteeloTGEExecuted: Emitted when the Token Generation Event (TGE) is executed.
 * - TokensStaked: Emitted when tokens are staked.
 * - TokensUnstaked: Emitted when tokens are unstaked.
 * - Approval: Emitted when an allowance is set for a spender by the owner.
 */
contract STEELOStakingFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when tokens are minted.
     * @param to The address that receives the minted tokens.
     * @param amount The amount of tokens minted.
     */
    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev Emitted when the Token Generation Event (TGE) is executed.
     * @param tgeAmount The amount of tokens generated.
     */
    event SteeloTGEExecuted(uint256 tgeAmount);

    /**
     * @dev Emitted when tokens are staked.
     * @param staker The address of the staker.
     * @param amount The amount of tokens staked.
     */
    event TokensStaked(address indexed staker, uint256 amount);

    /**
     * @dev Emitted when tokens are unstaked.
     * @param staker The address of the staker.
     * @param amount The amount of tokens unstaked.
     */
    event TokensUnstaked(address indexed staker, uint256 amount);

    /**
     * @dev Emitted when an allowance is set for a spender by the owner.
     * @param owner The address of the owner.
     * @param spender The address of the spender.
     * @param amount The amount of tokens approved for spending.
     */
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /**
     * @dev Initiates the Steelo token setup for the caller.
     * Emits a {TokensMinted} event.
     * @return success A boolean indicating if the initiation was successful.
     */
    function steeloInitiate() public returns (bool success) {
        LibSteelo.initiate(msg.sender);
        emit TokensMinted(msg.sender, AppConstants.TGE_AMOUNT);
        return true;
    }

    /**
     * @dev Executes the Token Generation Event (TGE) for the caller.
     * Emits a {SteeloTGEExecuted} event.
     * @return success A boolean indicating if the TGE execution was successful.
     */
    function steeloTGE() external returns (bool) {
        LibSteelo.TGE(msg.sender);
        emit SteeloTGEExecuted(AppConstants.TGE_AMOUNT);
        return true;
    }

    /**
     * @dev Returns the balance of Steelo tokens for a specified account.
     * @param account The address of the account.
     * @return The balance of Steelo tokens.
     */
    function steeloBalanceOf(address account) public view returns (uint256) {
        return s.balances[account];
    }

    /**
     * @dev Returns the allowance of a spender for a specified owner.
     * @param owner The address of the owner.
     * @param spender The address of the spender.
     * @return The allowance amount.
     */
    function steeloAllowance(address owner, address spender) public view returns (uint256) {
        return s.allowance[owner][spender];
    }

    /**
     * @dev Approves a spender to spend a specified amount of tokens on behalf of the caller.
     * Emits an {Approval} event.
     * @param spender The address of the spender.
     * @param amount The amount of tokens to approve.
     * @return success A boolean indicating if the approval was successful.
     */
    function steeloApprove(address spender, uint256 amount) public returns (bool success) {
        LibSteelo.approve(msg.sender, spender, amount);
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Stakes Steelo tokens.
     * Emits a {TokensStaked} event.
     * @return success A boolean indicating if the staking was successful.
     */
    function stakeSteelo() public payable returns (bool) {
        LibSteelo.stake(msg.sender, msg.value);
        emit TokensStaked(msg.sender, msg.value);
        return true;
    }

    /**
     * @dev Unstakes a specified amount of Steelo tokens.
     * Emits a {TokensUnstaked} event.
     * @param amount The amount of tokens to unstake.
     * @return success A boolean indicating if the unstaking was successful.
     */
    function unstakeSteelo(uint256 amount) external payable returns (bool) {
        LibSteelo.unstake(msg.sender, amount);
        emit TokensUnstaked(msg.sender, amount);
        return true;
    }
}