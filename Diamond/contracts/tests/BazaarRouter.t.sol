// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "../libraries/LibBazaarRouter.sol"; // Correct path for LibBazaarRouter.sol

contract TestBazaarRouter {

    LibBazaarRouter.AppStorage s;

    // Test Trade Routing
    function testTradeRouting() public {
        string memory creatorId = "creator-abc";

        // Assume we call the getSteezTransactionCount function to test routing
        uint256 txCount = LibBazaarRouter.getSteezTransactionCount(s, creatorId);
        Assert.equal(txCount, 0, "Initial transaction count should be 0");
    }

    // Test P2P Trade Freezing
    function testP2PTradeFreezing() public {
        string memory creatorId = "creator-abc";

        // Freeze the trades for a specific creator
        LibBazaarRouter.setP2PTradesFrozen(s, creatorId, true);
        bool isFrozen = s.bazaarData.steezOrderBooksFrozen[creatorId];
        Assert.isTrue(isFrozen, "Trades should be frozen");

        // Unfreeze and check
        LibBazaarRouter.setP2PTradesFrozen(s, creatorId, false);
        Assert.isFalse(s.bazaarData.steezOrderBooksFrozen[creatorId], "Trades should be unfrozen");
    }

    // Test Order Cancellation
    function testOrderCancellation() public {
        string memory creatorId = "creator-abc";

        // Assume active orders exist; we will delete them
        LibBazaarRouter.cancelActiveLimitOrders(s, creatorId);
        Assert.equal(s.bazaarData.activeLimitOrders[creatorId].length, 0, "All active orders should be canceled");
    }
}
