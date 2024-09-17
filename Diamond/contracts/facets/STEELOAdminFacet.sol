// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {AppConstants, Unstakers} from "../libraries/LibAppStorage.sol";
import {LibSteelo} from "../libraries/LibSteelo.sol";

/**
 * @title STEELOAdminFacet
 * @dev This contract manages administrative functions for the Steelo platform,
 *      including supply cap calculations, minting and burning rates adjustments,
 *      transaction verification, and ether management.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various administrative tools to maintain and manage
 *         the Steelo ecosystem.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibSteelo: Manages the core functionality related to supply cap, minting, burning, and transactions.
 * 
 * Events:
 * - SupplyCapCalculated: Emitted when the supply cap is calculated.
 * - MintRateAdjusted: Emitted when the mint rate is adjusted.
 * - BurnRateAdjusted: Emitted when the burn rate is adjusted.
 * - SteeloTokensBurned: Emitted when Steelo tokens are burned.
 * - TransactionVerified: Emitted when a transaction is verified.
 * - StakePeriodEnded: Emitted when a staking period ends.
 * - EtherWithdrawn: Emitted when ether is withdrawn from the contract.
 * - EtherDonated: Emitted when ether is donated to the contract.
 */
contract STEELOAdminFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when the supply cap is calculated.
     */
    event SupplyCapCalculated();

    /**
     * @dev Emitted when the mint rate is adjusted.
     * @param amount The new mint rate amount.
     */
    event MintRateAdjusted(uint256 amount);

    /**
     * @dev Emitted when the burn rate is adjusted.
     * @param amount The new burn rate amount.
     */
    event BurnRateAdjusted(uint256 amount);

    /**
     * @dev Emitted when Steelo tokens are burned.
     * @param burner The address that burned the tokens.
     */
    event SteeloTokensBurned(address burner);

    /**
     * @dev Emitted when a transaction is verified.
     * @param sipId The ID of the verified transaction.
     */
    event TransactionVerified(uint256 sipId);

    /**
     * @dev Emitted when a staking period ends.
     * @param staker The address of the staker.
     * @param month The month of the staking period.
     */
    event StakePeriodEnded(address staker, uint256 month);

    /**
     * @dev Emitted when ether is withdrawn from the contract.
     * @param executive The address of the executive who withdrew the ether.
     * @param amount The amount of ether withdrawn.
     */
    event EtherWithdrawn(address executive, uint256 amount);

    /**
     * @dev Emitted when ether is donated to the contract.
     * @param donor The address of the donor.
     * @param amount The amount of ether donated.
     */
    event EtherDonated(address donor, uint256 amount);

    /**
     * @dev Returns the current supply cap for Steelo tokens.
     * @return The current supply cap.
     */
    function steeloSupplyCap() public view returns (uint256) {
        return s.supplyCap;
    }

    /**
     * @dev Returns the current mint rate for Steelo tokens.
     * @return The current mint rate.
     */
    function steeloMintRate() public view returns (uint256) {
        return s.mintRate;
    }

    /**
     * @dev Returns the current burn rate for Steelo tokens.
     * @return The current burn rate.
     */
    function steeloBurnRate() public view returns (uint256) {
        return s.burnRate;
    }

    /**
     * @dev Returns the amount of Steelo tokens to be burned.
     * @return The burn amount.
     */
    function steeloBurnAmount() public view returns (uint256) {
        return s.burnAmount;
    }

    /**
     * @dev Returns the total amount of Steelo tokens that have been burned.
     * @return The total burn amount.
     */
    function steeloTotalBurnAmount() public view returns (uint256) {
        return s.totalBurned;
    }

    /**
     * @dev Returns the total amount of Steelo tokens that have been minted.
     * @return The total mint amount.
     */
    function steeloTotalMintAmount() public view returns (uint256) {
        return s.totalMinted;
    }

    /**
     * @dev Returns the contract's balance in ether.
     * @return The contract balance.
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Ends the staking period for the caller.
     * Emits a {StakePeriodEnded} event.
     * @param month The month of the staking period.
     */
    function stakePeriodEnder(uint256 month) public {
        LibSteelo.stakePeriodEnder(msg.sender, month);
        emit StakePeriodEnded(msg.sender, month);
    }

    /**
     * @dev Returns the staked balance of the caller.
     * @return The staked balance.
     */
    function getStakedBalance(address account) public view returns (uint256) {
        return s.stakers[account].amount;
    }

    /**
     * @dev Withdraws ether from the contract. Only executable by executives.
     * Emits a {EtherWithdrawn} event.
     * @param amount The amount of ether to withdraw.
     * @return A boolean indicating if the withdrawal was successful.
     */
    function withdrawEther(uint256 amount) external payable returns (bool) {
        require(s.executiveMembers[msg.sender], "only executive can withdraw Ether from the contract");
        require(address(this).balance >= amount, "no ether is available in the contract balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
        emit EtherWithdrawn(msg.sender, amount);
        return true;
    }

    /**
     * @dev Donates ether to the contract.
     * Emits a {EtherDonated} event.
     * @return A boolean indicating if the donation was successful.
     */
    function donateEther() external payable returns (bool) {
        LibSteelo.donateEther(msg.sender, msg.value);
        emit EtherDonated(msg.sender, msg.value);
        return true;
    }

    /**
     * @dev Returns an array of all unstakers.
     * @return An array of Unstakers.
     */
    function getUnstakers() public view returns (Unstakers[] memory) {
        return s.unstakers;
    }

    /**
     * @dev Returns the interest of the caller's staked balance.
     * @return The interest amount.
     */
    function getInterest(address account) public view returns (uint256) {
        return s.stakers[account].interest;
    }
}