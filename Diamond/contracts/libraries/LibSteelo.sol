// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./LibAppStorage.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {AppConstants} from "./LibAppStorage.sol";
import { Steez, Unstakers } from "./LibAppStorage.sol";

/**
 * @title LibSteelo
 * @dev This library contains the core logic for managing Steelo tokens and user accounts.
 */
library LibSteelo {

	/**
	* @dev Initializes the Steelo system by setting the treasury and initial parameters.
	* @param treasury The address of the treasury.
	*/
	function initiate(address treasury) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(!s.steeloInitiated, "steelo already initiated");
		require( treasury != address(0), "treasurer can not be zeero address");
		require (s.userMembers[treasury], "you  have no steelo account");
		require(s.executiveMembers[treasury], "only executive can initialize the steelo tokens");
		s.name = AppConstants.STEELO_NAME;
		s.symbol = AppConstants.STEELO_SYMBOL;
		s.treasury = treasury;
		s.steeloCurrentPrice = AppConstants.STEELO_INITIAL_PRICE;
		s.steeloInitiated = true;		
	}

	/**
	* @dev Executes the Token Generation Event (TGE) for Steelo tokens.
	* @param treasury The address of the treasury.
	*/
	function TGE(address treasury) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require( treasury != address(0), "token can not be generated with zero address");
		require (s.userMembers[treasury], "you  have no steelo account");
		require(s.executiveMembers[treasury], "only executive can initialize the steelo tokens");
		require(!s.tgeExecuted, "STEELOFacet: steeloTGE can only be executed once");
		require(s.totalTransactionCount == 0, "STEELOFacet: TransactionCount must be equal to 0");
		require(s.steeloCurrentPrice > 0, "STEELOFacet: steeloCurrentPrice must be greater than 0");
		require(s.totalSupply == 0, "STEELOFacet: steeloTGE can only be called for the Token Generation Event");

		uint256 communityAmount = (AppConstants.TGE_AMOUNT * AppConstants.COMMUNITY_TGE) / 100;
		uint256 foundersAmount = (AppConstants.TGE_AMOUNT * AppConstants.FOUNDERS_TGE) / 100;
		uint256 earlyInvestorsAmount = (AppConstants.TGE_AMOUNT * AppConstants.EARLY_INVESTORS_TGE) / 100;
		uint256 treasuryAmount = (AppConstants.TGE_AMOUNT * appConstants.TREASURY_TGE) / 100;

		mint(AppConstants.COMMUNITY_ADDRESS, communityAmount);
		mint(AppConstants.foundersAddress, foundersAmount);
		mint(AppConstants.EARLY_INVESTORS_ADDRESS, earlyInvestorsAmount);
		mint(s.treasury, treasuryAmount);

		s.mintTransactionLimit = AppConstants.TRANSACTION_LIMIT;
        	s.tgeExecuted = true;
	}

	/**
	* @dev Creates a Steelo user account.
	* @param account The address of the user.
	* @param profileId The profile ID of the user.
	*/
	function createSteeloUser(address account, string memory profileId, string memory profileName, string memory profileAvatar, string memory profileBio, address referrer) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(account != address(0), "Zero address cannot have a Steelo account");
		require(!s.userMembers[account], "Account already exists");
		require(bytes(s.userAlias[account]).length == 0, "Steelo account already exists, please login");

		s.userAlias[account] = profileId;
		s.userMembers[account] = true;
		
		if (bytes(s.roles[account]).length == 0 || keccak256(abi.encodePacked(s.roles[account])) == keccak256(abi.encodePacked(AppConstants.VISITOR_ROLE))) {
			s.roles[account] = AppConstants.USER_ROLE;
		}

		s.profiles[account] = Profile({
			profileAddress: account,
			profileId: profileId,
			profileName: profileName,
			profileAvatar: profileAvatar,
			profileBio: profileBio,
			referrer: referrer
		});

		uint256 newProfileId = uint256(keccak256(abi.encodePacked(profileId)));
		if (newProfileId > s._lastProfileId) {
			s._lastProfileId = newProfileId;
		}
	}

	/**
	* @dev Deletes a Steelo user account.
	* @param account The address of the user.
	*/
	function deleteSteeloUser(address account) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(account != address(0), "zero address can not delete user account");
		require(s.userMembers[account], "you do not have account");

		s.userAlias[account] = "";
		s.userMembers[account] = false;
		s.roles[account] = "";
		delete s.profiles[account];
	}

	/**
	* @dev Approves a certain amount of tokens for transfer by another account.
	* @param from The address of the account granting the allowance.
	* @param to The address of the account receiving the allowance.
	* @param amount The amount of tokens to approve.
	*/
	function approve(address from, address to, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require( from != address(0), "STEELOFacet: Cannot transfer from the zero address" );
		require( to != address(0), "STEELOFacet: Cannot transfer from the zero address" );
		require(from != to, "can not approve to ownself");
		require (s.userMembers[from], "you  have no steelo account");
		require( amount > 0, "you can not approve 0 amount");
		require(s.balances[from] >= amount, "you can not approve what you do not have");
		s.allowance[from][to] = amount;
	}

	/**
	* @dev Transfers tokens from one account to another.
	* @param from The address of the sender.
	* @param to The address of the recipient.
	* @param amount The amount of tokens to transfer.
	*/
	function transfer(address from, address to, uint256 amount) internal {
	    AppStorage storage s = LibAppStorage.diamondStorage();
		require( from != address(0), "STEELOFacet: Cannot transfer from the zero address" );
		require( to != address(0), "STEELOFacet: Cannot transfer to the zero address" );
		require(from != to, "can not transfer to ownself");
		require (s.userMembers[from], "you  have no steelo account");
		require(s.balances[from] >= amount, "you have insufficient steelo tokens to transfer");
		require( amount > 0, "you can not transfer 0 amount");
		uint256 transferAmount = amount;
		beforeTokenTransfer(from, transferAmount);
		s.balances[from] -= transferAmount;
		s.balances[to] += transferAmount;
		s.totalTransactionCount += 1;
	}

	/**
	* @dev Transfers tokens on behalf of another account.
	* @param from The address of the sender.
	* @param to The address of the recipient.
	* @param amount The amount of tokens to transfer.
	*/
	function transferFrom(address from, address to, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require( from != address(0), "STEELOFacet: Cannot transfer from the zero address" );
		require( to != address(0), "STEELOFacet: Cannot transfer to the zero address" );
		require(from != to, "can not transfer to ownself");
		require (s.userMembers[from], "you  have no steelo account");
		require(s.balances[from] >= amount, "you have insufficient steelo tokens to transfer");
		require(s.allowance[from][to] >= amount, "did not allow this much allowance");
		require( amount > 0, "you can not transfer 0 amount");
		beforeTokenTransfer(from, amount);
		s.balances[from] -= amount;
		s.balances[to] += amount;
		s.allowance[from][to] -= amount;
		s.totalTransactionCount += 1;
	}

	/**
	* @dev Burns a certain amount of tokens.
	* @param from The address of the account to burn tokens from.
	* @param amount The amount of tokens to burn.
	*/
	function burn(address from, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require (s.userMembers[from], "you  have no steelo account");
		require(s.adminMembers[from], "only admin can burn steelo tokens");
		require(amount > 0, "can not burn 0 amount");
		require(amount <= AppConstants.TGE_AMOUNT, "can not burn 825 million tokens");
		require(s.balances[from] > amount, "you should have enough amount to burn some tokens");
		s.balances[from] -= amount;
		s.totalSupply -= amount;
		s.totalTransactionCount += 1;
		s.totalBurned += amount;
	}

	/**
	* @dev Mints a certain amount of tokens.
	* @param from The address of the account to mint tokens to.
	* @param amount The amount of tokens to mint.
	*/
	function mint(address from, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
//		require(s.adminMembers[from], "only admins can mint steelo tokens");
		require(amount > 0, "can not mint 0 amount");
		require(amount <= AppConstants.TGE_AMOUNT, "can not mint more than 825 million tokens");
		s.balances[from] += amount;
		s.totalSupply += amount;
		s.totalTransactionCount += 1;
		s.totalMinted += amount;
	}

	/**
	* @dev Stakes a certain amount of ether.
	* @param from The address of the account staking ether.
	* @param amount The amount of ether to stake.
	*/
	function stake(address from, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(s.userMembers[from], "you have no steelo account");
		require(amount > 0, "you have no ether");
		require(s.balances[AppConstants.COMMUNITY_ADDRESS] > ((amount * AppConstants.POUND_DECIMALS) / s.steeloCurrentPrice), "market has insufficient steelo tokens");
		
		uint256 steeloAmount = (amount * AppConstants.POUND_DECIMALS) / s.steeloCurrentPrice;
		
		s.balances[from] += steeloAmount;
		s.balances[AppConstants.COMMUNITY_ADDRESS] -= steeloAmount;
		s.stakers[from].amount += amount;
		s.totalTransactionCount += 1;
		
		if (s.stakers[from].amount == amount) {
			s.stakers[from].endTime = block.timestamp + AppConstants.oneMonth;
		}
	}

	/**
	 * @dev Donates ether to the Steelo treasury.
	 * @param from The address of the donor.
	 * @param amount The amount of ether to donate.
	 */
	function donateEther(address from, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(s.userMembers[from], "you have no steelo account");
		require(s.executiveMembers[from], "only executive can initialize the steelo tokens");
		require(amount > 0, "you have no ether");
		s.balances[s.treasury] += ((amount * AppConstants.POUND_DECIMALS) / s.steeloCurrentPrice);
		s.totalTransactionCount += 1;
	}

	/**
	 * @dev Ends the stake period for a certain number of months.
	 * @param from The address of the account ending the stake period.
	 * @param month The number of months to end the stake period by.
	 */
	function stakePeriodEnder(address from, uint256 month) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.stakers[from].endTime -= (AppConstants.oneMonth * month);
	}

	/**
	 * @dev Unstakes a certain amount of ether.
	 * @param from The address of the account unstaking ether.
	 * @param amount The amount of ether to unstake.
	 */
	function unstake(address from, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();

		bool unstakeAgain;
		amount = (amount * s.steeloCurrentPrice) / AppConstants.POUND_DECIMALS;
		require(amount > 0, "cannot unstake 0 amount");
		require(address(this).balance >= (amount + (amount * s.stakers[msg.sender].month) / 100), "insufficient ether in the treasury or contract balance");
		require(s.userMembers[from], "you have no steelo account");
		require(s.balances[from] + ((s.balances[from] * s.stakers[from].interest) / 10000) >= ((amount * AppConstants.POUND_DECIMALS) / s.steeloCurrentPrice), "insufficient steelo tokens to sell");
		require(block.timestamp >= s.stakers[from].endTime, "staking period is not over yet");
		require(s.stakers[from].amount + ((s.stakers[from].amount * s.stakers[from].interest) / 10000) >= amount, "requesting more ether than staked");

		s.stakers[from].month = (block.timestamp - s.stakers[from].endTime) / AppConstants.oneMonth + 1;
		s.stakers[from].month = s.stakers[from].month > 6 ? 6 : s.stakers[from].month;

		if (s.stakers[from].interest > 0) {
			s.stakers[from].interest = ((s.stakers[from].interest * s.stakers[from].amount) + (s.stakers[from].month * amount * 100)) / (s.stakers[from].amount + amount);
		} else {
			s.stakers[from].interest = s.stakers[from].month * 100;
		}
		for (uint256 i = 0; i < s.unstakers.length; i++) {
			if (from == s.unstakers[i].account) {
				unstakeAgain = true;
				s.unstakers[i].amount = amount;
				break;
			}
		}
		if (!unstakeAgain) {
			require(s.unstakers.length <= AppConstants.MAX_UNSTAKERS_LENGTH, "the unstakers queue is filled right now, please try another time");
			Unstakers memory newUnstaker = Unstakers({
				account: from,
				amount: amount
			});
			s.unstakers.push(newUnstaker);
		}
	}

	/**
	 * @dev Calculates the total transaction amount.
	 */
	function getTotalTransactionAmount() internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		uint256 length = s.allCreatorIds.length;
	}

	/**
	* @dev Performs operations before a token transfer.
	* @param from The address of the sender.
	* @param amount The amount of tokens to transfer.
	*/
	function beforeTokenTransfer(address from, uint256 amount ) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
//		require (s.userMembers[from], "you  have no steelo account");
		s.burnAmount = calculateBurnAmount(amount);
		if (s.burnAmount > 0 && from != address(0)) {
			require(s.balances[s.treasury] >= s.burnAmount, "treasury has insufficient steelo tokens to burn");
			s.balances[s.treasury] -= s.burnAmount;		
			s.totalSupply -= s.burnAmount;
			s.totalBurned += s.burnAmount;
		}
		s.mintAmount = calculateMintAmount(amount);
		if (s.mintAmount > 0 && from != address(0)) {
			mintAdvanced(s.mintAmount);	
		}
	}

	/**
	* @dev Mints tokens based on the current transaction rate.
	* @param amount The amount of tokens to mint.
	*/
	function mintAdvanced(uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		require(s.totalTransactionCount > 0, "STEELOFacet: TransactionCount must be equal to 0");
		require(s.steeloCurrentPrice > 0, "STEELOFacet: steeloCurrentPrice must be greater than 0");
		require(s.totalSupply > 0, "STEELOFacet: steeloTGE can only be called for the Token Generation Event");

		uint256 treasuryAmount = (amount * appConstants.TREASURY_MINT) / 100;
		uint256 LIQUIDITY_PROVIDERSAmount = (amount * AppConstants.LIQUIDITY_PROVIDERS_MINT) / 100;
		uint256 ECOSYSTEM_PROVIDERSAmount = (amount * AppConstants.ECOSYSTEM_PROVIDERS_MINT) / 100;

		mint(s.treasury, treasuryAmount);
		mint(AppConstants.LIQUIDITY_PROVIDERS, LIQUIDITY_PROVIDERSAmount);
		mint(AppConstants.ECOSYSTEM_PROVIDERS, ECOSYSTEM_PROVIDERSAmount);

		s.totalMinted += amount;
		s.lastMintEvent = block.timestamp;
	}

	/**
	* @dev Calculates the amount of tokens to burn based on the transaction value.
	* @param transactionValue The value of the transaction.
	* @return The amount of tokens to burn.
	*/
	function calculateBurnAmount( uint256 transactionValue ) private returns (uint256) {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.burnRate = 0;
		if (s.steeloCurrentPrice <= AppConstants.P_MIN * AppConstants.LOW_RATE) {
			s.burnRate = AppConstants.LOW_RATE_VALUE;
		}
		if (s.steeloCurrentPrice <= AppConstants.P_MIN * AppConstants.MODERATE_RATE) {
			s.burnRate = AppConstants.MODERATE_RATE_VALUE;
		}
		if (s.steeloCurrentPrice <= AppConstants.P_MIN * AppConstants.HIGH_RATE) {
			s.burnRate = AppConstants.HIGH_RATE_VALUE;
		}

		if (s.totalTransactionCount > 0) {
			s.burnAmount = ((transactionValue * s.burnRate) / 1000);
			require( s.burnRate >= AppConstants.MIN_BURN_RATE && s.burnRate <= AppConstants.MAX_BURN_RATE, "STEELOFacet: Suggested Burn Rate not within permitted range");
			return s.burnAmount;
		} else {
			return 0;
		}
	}

	/**
	* @dev Calculates the amount of tokens to mint based on the transaction value.
	* @param transactionValue The value of the transaction.
	* @return The amount of tokens to mint.
	*/
	function calculateMintAmount( uint256 transactionValue ) private returns (uint256) {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.mintRate = 0;
		if (s.steeloCurrentPrice >= AppConstants.P_MIN * AppConstants.LOW_RATE) {
			s.mintRate = AppConstants.LOW_RATE_VALUE;
		}
		if (s.steeloCurrentPrice >= AppConstants.P_MIN * AppConstants.MODERATE_RATE) {
			s.mintRate = AppConstants.MODERATE_RATE_VALUE;
		}
		if (s.steeloCurrentPrice >= AppConstants.P_MIN * AppConstants.HIGH_RATE) {
			s.mintRate = AppConstants.HIGH_RATE_VALUE;
		}
		if (s.totalTransactionCount > 0) {
			s.mintAmount = ((transactionValue * s.mintRate) / 1000);
			require( s.mintRate >= AppConstants.MIN_MINT_RATE && s.mintRate <= AppConstants.MAX_MINT_RATE, "STEELOFacet: Suggested Mint Rate not within permitted range");
			return s.mintAmount;
		} else {
			return 0;
		}
	}
	
	/**
	* @dev Adjusts the supply cap based on the current price.
	*/
	function calculateSupplyCap () internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		uint256 currentSupply = s.totalSupply;
		if (s.steeloCurrentPrice < AppConstants.P_MIN) {
			s.supplyCap = (currentSupply - (AppConstants.DELTA * (AppConstants.P_MIN - s.steeloCurrentPrice) * currentSupply) / (AppConstants.SUPPLY_CAP_DIVIDER));
		} else {
			s.supplyCap = currentSupply;
		}
	}

	/**
    * @dev Adjusts the mint rate.
    * @param amount The new mint rate.
    */
	function adjustMintRate(uint256 amount) internal {
		amount = amount * AppConstants.DECIMAL;
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.mintRate = amount;	
	}	

	/**
    * @dev Adjusts the burn rate.
    * @param amount The new burn rate.
    */
	function adjustBurnRate(uint256 amount) internal {
		amount = amount * AppConstants.DECIMAL;
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.burnRate = amount / AppConstants.DECIMAL;	
	}

	/**
    * @dev Burns tokens from a specific account.
    * @param from The address of the account to burn tokens from.
    */
	function burnTokens(address from) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.burnAmount = 	(((s.steeloCurrentPrice * AppConstants.FEE_RATE) / 1000) * s.burnRate) / 100;
		burn(from, s.burnAmount);
		s.totalBurned += s.burnAmount;
		s.lastBurnEvent = block.timestamp;
	}

	/**
    * @dev Initializes the ERC20 contract.
    * @param owner The address of the owner.
    */
	function initializeERC20(address owner) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.owner = owner;
		s.totalSupply = AppConstants.TGE_AMOUNT;
		s.balances[owner] = s.totalSupply;
	}

	/**
    * @dev Transfers tokens from one account to another.
    * @param sender The address of the sender.
    * @param recipient The address of the recipient.
    * @param amount The amount of tokens to transfer.
    */
	function _transfer(address sender, address recipient, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		beforeTokenTransfer(sender, amount);
		s.balances[sender] -= amount;
		s.balances[recipient] += amount;
	}

	/**
    * @dev Approves a spender to transfer tokens from the caller's account.
    * @param sender The address of the caller.
    * @param recipient The address of the spender.
    * @param amount The amount of tokens to approve.
    */
	function _approve(address sender, address recipient, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.allowance[sender][recipient] = amount;
	}

	/**
    * @dev Mints tokens to a specific account.
    * @param minter The address of the account to mint tokens to.
    * @param amount The amount of tokens to mint.
    */
	function _mint(address minter, uint256 amount) internal {
		AppStorage storage s = LibAppStorage.diamondStorage();
		s.totalSupply += amount;
		s.balances[minter] += amount;
	}
}