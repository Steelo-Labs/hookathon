// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./LibAppStorage.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {AppConstants} from "./LibAppStorage.sol";
import {Creator, Steez, Investor, Seller, Content, DailySteezPrice, DailySteeloInvestment, DailyTotalSteeloInvestment, Collaborator} from "./LibAppStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
* @title LibSteez Library
* @dev Library for managing Steez operations such as creating creators, managing auctions, and handling content.
*/
library LibSteez {
    using SafeMath for uint256;

    event SteezMinted(string indexed creatorId, address indexed to, uint256 id, uint256 amount);
    event SteezTransferred(string indexed creatorId, address indexed from, address indexed to, uint256 id, uint256 amount);
    event CreatorCreated(address indexed creator, string profileId);
    event SteezCreated(address indexed creator, string creatorId, string steezName, string steezSymbol);
    event ContentCreated(string indexed creatorId, string videoId);
    event CreatorFrozen(string indexed creatorId);

    error ZeroAddress();
    error NoCreatorAccount();
    error CreatorAccountExists();
    error InsufficientBalance();
    error InvalidAmount();
    error SteezAlreadyExists();
    error SteeloNotInitialized();

    /**
    * @dev Initiates the Steez system for the creatorId address.
    * @param creatorId The address of the creator initiating the Steez system.
    */
    function initiate(address creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (creatorId == address(0)) revert ZeroAddress();
        require(s.userMembers[creatorId], "You have no Steelo account");
        require(creatorId == s.treasury, "Only treasurer can initiate Steez");
        require(!s.steezInitiated, "Steez already initiated");
        s.creatorTokenName = AppConstants.STEEZ_NAME;
        s.creatorTokenSymbol = AppConstants.STEEZ_SYMBOL;	
        s.steezInitiated = true;
    }

    /**
    * @dev Creates a new creator profile.
    * @param creator The address of the creator.
    * @param profileId The ID of the creator profile.
    */
    function createCreator(address creator, string memory profileId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (creator == address(0)) revert ZeroAddress();
        if (s.creatorMembers[creator]) revert CreatorAccountExists();
        if (bytes(s.creatorIdentity[creator]).length != 0) revert CreatorAccountExists();

        Creator memory newCreator = Creator({
            creatorId: profileId,
            profileAddress: creator
        });

        s.userMembers[creator] = true;
        s.visitorMembers[creator] = true;
        s.creatorMembers[creator] = true;
        s.collaboratorMembers[creator] = true;

        s.creatorIdentity[creator] = profileId;
        s.userAlias[creator] = profileId;
        s.creators[profileId] = newCreator;

        emit CreatorCreated(creator, profileId);
    }

    /**
    * @dev Deletes an existing creator profile.
    * @param creator The address of the creator.
    * @param profileId The ID of the creator profile.
    */
    function deleteCreator(address creator, string memory profileId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (creator == address(0)) revert ZeroAddress();
        require(s.creators[profileId].profileAddress == creator, "You cannot delete other creators' accounts");
        require(bytes(s.creatorIdentity[creator]).length != 0, "You have no creator account");
        
        s.creatorIdentity[creator] = "";
        s.userAlias[creator] = "";
        delete s.creators[profileId];
        delete s.steez[profileId];
        s.userMembers[creator] = false;
        s.visitorMembers[creator] = false;
        s.creatorMembers[creator] = false;
        s.collaboratorMembers[creator] = false;
        
        uint256 length = s.allCreators.length;
        for (uint256 i = 0; i < length; i++) {
            if (s.allCreators[i].creatorAddress == creator) {
                s.allCreators[i] = s.allCreators[length - 1];
                s.allCreators.pop();
                break;
            }
        }	 
    }

    /**
    * @dev Freezes a creator's account, pausing their bazaar/trades/etc.
    * @param creatorId The ID of the creator to freeze.
    */
    function freezeCreator(string memory creatorId) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        require(bytes(creatorId).length != 0, "Invalid creator ID");
        require(s.creators[creatorId].profileAddress != address(0), "Creator does not exist");
        
        s.frozenCreators[creatorId] = true;
        emit CreatorFrozen(creatorId);
    }

    /**
    * @dev Creates a Steez token for a creator.
    * @param creator The address of the creator.
    * @param steezName The name of the Steez token.
    * @param steezSymbol The symbol of the Steez token.
    */
    function createSteez(address creator, string memory creatorId, string memory steezName, string memory steezSymbol) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (creator == address(0)) revert ZeroAddress();
        if (bytes(s.creatorIdentity[creator]).length == 0) revert NoCreatorAccount();
        if (s.steez[creatorId].creatorAddress != address(0) || s.steez[creatorId].creatorExists) revert SteezAlreadyExists();

        s.creators[creatorId] = LibAppStorage.Creator({
            creatorId: creatorId,
            profileAddress: creator
        });

        s.steez[creatorId] = LibAppStorage.Steez({
            creatorId: creatorId,
            steezId: creatorId,
            steezName: steezName,
            steezSymbol: steezSymbol,
            creatorAddress: creator,
            baseURI: "",
            creatorExists: true,
            totalSupply: AppConstants.PRE_ORDER_SUPPLY,
            transactionCount: 0,
            bazaarState: LibAppStorage.BazaarState.Inactive,
            currentPrice: (AppConstants.INITIAL_STEEZ_PRICE_CENT * AppConstants.POUND_DECIMALS * AppConstants.STEELO_DECIMALS) / (100 * s.steeloCurrentPrice),
            oldPrice: (AppConstants.INITIAL_STEEZ_PRICE_CENT * AppConstants.POUND_DECIMALS * AppConstants.STEELO_DECIMALS) / (100 * s.steeloCurrentPrice),
            steezPriceFluctuation: 0,
            liquidityPool: 0,
            totalSteeloPreOrder: 0,
            lastMintTime: block.timestamp,
            anniversaryDate: block.timestamp + AppConstants.oneYear,
            preOrderStartTime: 0,
            auctionStartTime: block.timestamp + AppConstants.oneWeek,
            auctionSlotsSecured: 0,
            auctionConcluded: false,
            hourGapPercentage: 0,
            dayGapPriceFluctutation: 0,
            name: steezName,
            symbol: steezSymbol,
            steezPrice: (AppConstants.INITIAL_STEEZ_PRICE_CENT * AppConstants.POUND_DECIMALS * AppConstants.STEELO_DECIMALS) / (100 * s.steeloCurrentPrice),
            totalInvestors: 0,
            status: AppConstants.STATUS_NOT_INITIATED
        });

        s.allCreators.push(s.steez[creatorId]);

        s.mintingTransactionLimit[creatorId] = AppConstants.TRANSACTION_LIMIT_STEEZ;

        emit SteezCreated(creator, creatorId, steezName, steezSymbol);
    }

    /**
    * @dev Mints Steez tokens for a creator.
    * @param creatorId The ID of the creator.
    * @param to The address receiving the tokens.
    * @param id The id of the token to mint.
    * @param amount The amount of tokens to mint.
    */
    function mintToken(string memory creatorId, address to, uint256 id, uint256 amount) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (amount > AppConstants.EXPANSION_SUPPLY) revert InvalidAmount();

        s.steez[creatorId].totalSupply = s.steez[creatorId].totalSupply.add(amount);
        s.steez[creatorId].balances[id][to] = s.steez[creatorId].balances[id][to].add(amount);
        s.steez[creatorId].transactionCount = s.steez[creatorId].transactionCount.add(1);

        emit SteezMinted(creatorId, to, id, amount);
    }

    /**
    * @dev Gets the balance of Steez tokens for a user.
    * @param creatorId The ID of the creator.
    * @param account The address of the user.
    * @param id The id of the token.
    * @return The balance of Steez tokens.
    */
    function balanceOf(string memory creatorId, address account, uint256 id) internal view returns (uint256) {
        return LibAppStorage.diamondStorage().steez[creatorId].balances[id][account];
    }

    /**
    * @dev Gets the total supply of Steez tokens for a creator.
    * @param creatorId The ID of the creator.
    * @return The total supply of Steez tokens.
    */
    function totalSupply(string memory creatorId) internal view returns (uint256) {
        return LibAppStorage.diamondStorage().steez[creatorId].totalSupply;
    }

    /**
    * @dev Transfers Steez tokens from one address to another.
    * @param creatorId The ID of the creator.
    * @param from The address sending the tokens.
    * @param to The address receiving the tokens.
    * @param id The id of the token to transfer.
    * @param amount The amount of tokens to transfer.
    */
    function transferToken(string memory creatorId, address from, address to, uint256 id, uint256 amount) internal {
        LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (s.steez[creatorId].balances[id][from] < amount) revert InsufficientBalance();

        s.steez[creatorId].balances[id][from] = s.steez[creatorId].balances[id][from].sub(amount);
        s.steez[creatorId].balances[id][to] = s.steez[creatorId].balances[id][to].add(amount);

        emit SteezTransferred(creatorId, from, to, id, amount);
    }

	/**
	* @dev Adds a collaborator to a content.
	* @param creator The address of the creator.
	* @param creatorId The ID of the creator.
	* @param contentId The ID of the content.
	* @param collaboratorAddress The address of the collaborator.
	* @param collaboratorPercent The percentage of the content owned by the collaborator.
	* @param collaboratorName The name of the collaborator.
	* @param profileUrl The URL of the collaborator's profile.
	* @param collaboratorRole The role of the collaborator.
	*/
	function addCollaborator( address creator, string memory creatorId,string memory contentId, address collaboratorAddress, uint256 collaboratorPercent,string memory collaboratorName, string memory profileUrl, string memory collaboratorRole) internal {
		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
	        require( creator != address(0), "STEEZFacet: Cannot mint to zero address" );
		require(keccak256(abi.encodePacked(s.creatorIdentity[creator])) != keccak256(abi.encodePacked("")), "you have no creator account please create a creator account");
		require( s.creatorContent[creatorId][contentId].creatorAddress == creator, "you do not have a content by this id.");

		Collaborator memory newCollaborator = Collaborator({
			contentId: contentId,
			walletAddress: collaboratorAddress,
			collaboratorPercent: collaboratorPercent,
			name: collaboratorName,
			profileUrl: profileUrl,
			collaboratorRole: collaboratorRole
		});

		s.collaborators[contentId].push(newCollaborator);
	}

	/**
	* @dev Creates content for a creator.
	* @param creator The address of the creator.
	* @param videoId The ID of the video content.
	* @param exclusivity The exclusivity status of the content.
	*/
	function createContent( address creator, string memory videoId, string memory name, string memory thumbnailUrl, string memory videoUrl, string memory description, bool exclusivity) internal {
		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
	        require( creator != address(0), "STEEZFacet: Cannot mint to zero address" );
		require(keccak256(abi.encodePacked(s.creatorIdentity[creator])) != keccak256(abi.encodePacked("")), "you have no creator account please create a creator account");
	
		string memory creatorId = s.creatorIdentity[creator];
			
		Content memory newContent = Content({
        		creatorId: creatorId,
         		contentId: videoId,
			contentName: name,
			contentThumbnailUrl: thumbnailUrl,
			contentVideoUrl: videoUrl,
			contentDescription: description, 
			exclusivity: exclusivity,
			creatorAddress: creator,
			uploadTimestamp: block.timestamp
        	});
		s.creatorContent[creatorId][videoId] = newContent; 
		s.creatorCollections[creatorId].push(newContent);
		s.collections.push(newContent);
	}

	/**
	* @dev Deletes content for a creator.
	* @param creator The address of the creator.
	* @param videoId The ID of the video content.
	*/
	function deleteContent( address creator, string memory videoId ) internal {
		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
		require( creator != address(0), "STEEZFacet: Cannot delete to zero address" );
		require(keccak256(abi.encodePacked(s.creatorIdentity[creator])) != keccak256(abi.encodePacked("")), "you have no creator account please create a creator account");
	
		string memory creatorId = s.creatorIdentity[creator];
		require(s.creatorContent[creatorId][videoId].creatorAddress == creator, "you can not delete other creators content");
	
		uint256 length = s.creatorCollections[creatorId].length;
		for (uint256 i = 0; i < length; i++) {
			if (keccak256(abi.encodePacked(s.creatorCollections[creatorId][i].contentId)) == keccak256(abi.encodePacked(videoId))) {
				s.creatorCollections[creatorId][i] =  s.creatorCollections[creatorId][length - 1];
				s.creatorCollections[creatorId].pop();
				break;
				}
			}

		uint256 len = s.collections.length;
	
		for (uint256 i = 0; i < len; i++) {
			if (keccak256(abi.encodePacked(s.collections[i].contentId)) == keccak256(abi.encodePacked(videoId))) {
				s.collections[i] =  s.collections[len - 1];
				s.collections.pop();
				break;
			}
		}
		delete s.creatorContent[creatorId][videoId]; 
	}

	/**
	* @dev Mints Steez tokens for a creator.
	* @param to The address receiving the tokens.
	* @param creatorId The ID of the creator.
	* @param amount The amount of tokens to mint.
	*/
	function mintSteez( address to, string memory creatorId,  uint256 amount ) internal {
		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
        	require(to != address(0), "STEEZFacet: mint to the zero address");
        	require(amount > 0, "STEEZFacet: mint amount must be positive");
        	require(amount <= AppConstants.EXPANSION_SUPPLY, "STEEZFacet: mint amount must be less than 500");
        		
		s.steez[creatorId].liquidityPool += amount;
		s.totalSteezTransaction[creatorId] += 1;
	}

	/**
	* @dev Calcualtes the percentage of the creators steez price fluctuation.
	* @param creatorId The ID of the creator.
	*/
	function calculatePercentage(string memory creatorId) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
			int256 percentage = (((int256(s.steez[creatorId].currentPrice) - int256(s.steez[creatorId].oldPrice))) * (10 ** 18))/ (int256(s.steez[creatorId].currentPrice));
			s.steez[creatorId].percentage = percentage;
			s.steez[creatorId].oldPrice = s.steez[creatorId].currentPrice;
			s.steez[creatorId].steezPriceFluctuation = percentage;
			for (uint i = 0; i < s.allCreators.length; i++) {
        		if (keccak256(abi.encodePacked(s.allCreators[i].creatorId)) == keccak256(abi.encodePacked(creatorId))) {
        			s.allCreators[i].steezPriceFluctuation = percentage;
				break;
        		}
    		}
			s.steez[creatorId].hourGapPercentage = block.timestamp;
		}

	/**
	* @dev Calcualtes the daily steez price fluctuation.
	* @param creatorId The ID of the creator.
	*/
	function calculateDailyPriceFluctuation(string memory creatorId) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
			DailySteezPrice memory newDailySteezPrice = DailySteezPrice({
            			steezPrice: s.steez[creatorId].currentPrice,
            			day: block.timestamp
        		});
        		s.steez[creatorId].dailySteezPrices.push(newDailySteezPrice);
			s.steez[creatorId].dayGapPriceFluctutation = block.timestamp;
		}

	/**
	* @dev Calculates the daily steezo investment.
	* @param creatorId The ID of the creator.
	* @param account The address of the investor.
	*/
	function calculateDailyInvestment(string memory creatorId, address account) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
			DailySteeloInvestment memory newDailySteeloInvestment = DailySteeloInvestment({
            			steeloInvested: s.steez[creatorId].SteeloInvestors[account],
            			day: block.timestamp
        		});
        		s.steez[creatorId].steeloDailyInvestments[account].push(newDailySteeloInvestment);
			s.steez[creatorId].dayGapSteeloInvestment[account] = block.timestamp;
		}

	/**
	* @dev Calculates the daily total steezo investment.
	* @param creatorId The ID of the creator.
	* @param account The address of the investor.
	*/
	function calculateDailyTotalInvestment(string memory creatorId, address account) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
			DailyTotalSteeloInvestment memory newDailyTotalSteeloInvestment = DailyTotalSteeloInvestment({
            			steeloInvested: s.totalSteeloInvested[account],
            			day: block.timestamp
        		});
        		s.steeloDailyTotalInvestments[account].push(newDailyTotalSteeloInvestment);
			s.dayGapTotalSteeloInvestment[account] = block.timestamp;
		}

	/**
	* @dev Sorts the investors of a creator's Steez based on their invested amount.
	* @param creatorId The ID of the creator.
	*/
	function sortInvestors(string memory creatorId) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
    		uint length = s.steez[creatorId].investors.length;
		Investor memory temp;
    
		for (uint i = 0; i < length; i++) {
			for (uint j = 0; j < length - i - 1; j++) {
				if (s.steez[creatorId].investors[j].steeloInvested > s.steez[creatorId].investors[j + 1].steeloInvested) {
					temp = s.steez[creatorId].investors[j];
					s.steez[creatorId].investors[j] =  s.steez[creatorId].investors[j + 1];
					s.steez[creatorId].investors[j + 1] = temp;
				}
			}
		}
	}

	/**
	* @dev Finds the investor with the highest time invested in a creator's Steez.
	* @param creatorId The ID of the creator.
	*/
	function findPopInvestor(string memory creatorId) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
    		uint length = s.steez[creatorId].investors.length;

		if (length == 0) return;

		uint256 max = s.steez[creatorId].investors[0].timeInvested;
		s.popInvestorIndex = 0;
        
        	for (uint i = 1; i < length && (s.steez[creatorId].investors[i - 1].steeloInvested == s.steez[creatorId].investors[i].steeloInvested); i++) {
            		if (s.steez[creatorId].investors[i].timeInvested > max ) {
				max =  s.steez[creatorId].investors[i].timeInvested;
                		s.popInvestorIndex = i;
            			}
        		}	
		}

	/**
	* @dev Removes the investor with the highest time invested in a creator's Steez.
	* @param creatorId The ID of the creator.
	*/
	function removeInvestor(string memory creatorId) internal {
    		LibAppStorage.AppStorage storage s = LibAppStorage.diamondStorage();
		require(s.popInvestorIndex < s.steez[creatorId].investors.length, "index out of bounds");
		s.balances[s.steez[creatorId].investors[s.popInvestorIndex].walletAddress] += s.steez[creatorId].investors[s.popInvestorIndex].steeloInvested;
//		s.stakers[s.steez[creatorId].investors[s.popInvestorIndex].walletAddress].amount += ((s.steez[creatorId].investors[s.popInvestorIndex].steeloInvested * s.steeloCurrentPrice)/ AppConstants.POUND_DECIMALS);
		s.steez[creatorId].SteeloInvestors[s.steez[creatorId].investors[s.popInvestorIndex].walletAddress] -= s.steez[creatorId].investors[s.popInvestorIndex].steeloInvested;
		s.totalSteeloInvested[s.steez[creatorId].investors[s.popInvestorIndex].walletAddress] -= s.steez[creatorId].investors[s.popInvestorIndex].steeloInvested;
		s.steez[creatorId].totalSteeloPreOrder -= s.steez[creatorId].investors[s.popInvestorIndex].steeloInvested; 
    		uint length = s.steez[creatorId].investors.length;
		s.steez[creatorId].investors[s.popInvestorIndex] =  s.steez[creatorId].investors[length - 1];
		s.steez[creatorId].investors.pop();
		s.totalTransactionCount += 1;
	}
}