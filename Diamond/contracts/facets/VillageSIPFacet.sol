// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import {LibSIP} from "../libraries/LibSIP.sol";
import {AppConstants, SIP, Voter} from "../libraries/LibAppStorage.sol";

/**
 * @title VillageSIPFacet
 * @dev This contract manages the Steelo Improvement Proposal (SIP) system, 
 *      allowing users to propose, view, and vote on SIPs.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract facilitates a democratic process for platform governance, 
 *         ensuring that all stakeholders can participate in decision-making.
 * 
 * Libraries:
 * - LibAppStorage: Provides the data storage structure for the contract.
 * - LibSIP: Manages the proposal, registration, and voting logic for SIPs.
 * 
 * Events:
 * - SIPProposed: Emitted when a new SIP is proposed.
 * - VoterRegistered: Emitted when a voter is registered for a SIP.
 * - VoteCast: Emitted when a vote is cast on a SIP.
 */
contract VillageSIPFacet {
    AppStorage internal s;

    /**
     * @dev Emitted when a new SIP is proposed.
     * @param proposer The address that proposes the SIP.
     * @param title The title of the SIP.
     * @param description The description of the SIP.
     * @param sipType The type/category of the SIP.
     */
    event SIPProposed(address indexed proposer, string title, string description, string sipType);

    /**
     * @dev Emitted when a voter is registered for a SIP.
     * @param voter The address of the registered voter.
     * @param sipId The ID of the SIP.
     */
    event VoterRegistered(address indexed voter, uint256 indexed sipId);

    /**
     * @dev Emitted when a vote is cast on a SIP.
     * @param voter The address that cast the vote.
     * @param sipId The ID of the SIP.
     * @param vote The vote cast (true for yes, false for no).
     */
    event VoteCast(address indexed voter, uint256 indexed sipId, bool vote);

    /**
     * @dev Proposes a new SIP.
     * Emits an {SIPProposed} event.
     * @param title The title of the SIP.
     * @param description The description of the SIP.
     * @param sipType The type/category of the SIP.
     */
    function proposeSIP(string memory title, string memory description, string memory sipType) public {
        LibSIP.propose(msg.sender, title, description, sipType);
        emit SIPProposed(msg.sender, title, description, sipType);
    }

    /**
     * @dev Returns the details of a SIP proposal by ID.
     * @param sipId The ID of the SIP.
     * @return The SIP details.
     */
    function getSIPProposal(uint256 sipId) public view returns (SIP memory) {
        return s.sips[sipId];
    }

    /**
     * @dev Returns all SIP proposals.
     * @return An array of all SIPs.
     */
    function getAllSIPProposal() public view returns (SIP[] memory) {
        return s.allSIPs;
    }

    /**
     * @dev Registers a voter for a SIP.
     * Emits a {VoterRegistered} event.
     * @param sipId The ID of the SIP.
     */
    function registerVoter(uint256 sipId) public {
        LibSIP.register(msg.sender, sipId);
        emit VoterRegistered(msg.sender, sipId);
    }

    /**
     * @dev Returns the voting details of a voter for a specific SIP.
     * @param sipId The ID of the SIP.
     * @return The Voter details.
     */
    function getVoter(uint256 sipId, address voter) public view returns (Voter memory) {
        return s.votes[sipId][voter];
    }

    /**
     * @dev Casts a vote on a SIP.
     * Emits a {VoteCast} event.
     * @param sipId The ID of the SIP.
     * @param vote The vote to cast (true for yes, false for no).
     */
    function voteOnSip(uint256 sipId, bool vote) public {
        LibSIP.voteOnSip(msg.sender, sipId, vote);
        emit VoteCast(msg.sender, sipId, vote);
    }

    /**
     * @dev Ends the voting period for a SIP.
     * @param sipId The ID of the SIP.
     */
    function SIPTimeEnder(uint256 sipId) public {
        LibSIP.SIPTimeEnder(sipId);
    }

    /**
     * @dev Changes the role of a user based on the SIP outcome.
     * @param sipId The ID of the SIP.
     */
    function roleChanger(uint256 sipId, address account) public {
        LibSIP.roleChanger(sipId, account);
    }
}