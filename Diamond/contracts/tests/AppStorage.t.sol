// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "../libraries/LibAppStorage.sol"; // Correct path for LibAppStorage.sol

contract TestAppStorage {

    LibAppStorage.AppStorage s;

    // Test Content Creation
    function testContentCreation() public {
        string memory contentId = "content-123";
        string memory creatorId = "creator-abc";
        string memory thumbnailUrl = "https://example.com/thumb";
        string memory videoUrl = "https://example.com/video";

        s.contents[contentId] = LibAppStorage.Content({
            contentId: contentId,
            creatorId: creatorId,
            contentThumbnailUrl: thumbnailUrl,
            contentVideoUrl: videoUrl,
            contentName: "Sample Content",
            contentDescription: "This is a sample",
            exclusivity: false,
            uploadTimestamp: block.timestamp,
            creatorAddress: msg.sender
        });

        // Check that content was stored properly
        Assert.equal(s.contents[contentId].contentId, contentId, "Content ID should match");
        Assert.equal(s.contents[contentId].creatorId, creatorId, "Creator ID should match");
    }

    // Test Contributor Management
    function testContributorManagement() public {
        string memory contentId = "content-123";
        uint256 contributorId = 1;
        uint256 contributionPercentage = 50;

        s.contributors[contentId][contributorId] = LibAppStorage.Contributor({
            creatorId: 1,
            contributorId: contributorId,
            contentId: 1,
            contribution: 1,
            percentage: contributionPercentage
        });

        // Check that the contributor was added correctly
        Assert.equal(s.contributors[contentId][contributorId].percentage, contributionPercentage, "Percentage should match");
    }

    // Test Investor State
    function testInvestorState() public {
        address investorAddress = address(0x123);
        uint256 investment = 100;

        s.investors[investorAddress] = LibAppStorage.Investor({
            investorAddress: investorAddress,
            investment: investment
        });

        // Validate the investor state
        Assert.equal(s.investors[investorAddress].investment, investment, "Investment amount should match");
    }
}
