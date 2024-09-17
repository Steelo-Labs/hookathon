// forge script script/V4Deployer.s.sol \
//   --rpc-url https://polygonzkevm-cardona.g.alchemy.com/v2/fwxwkztDaAjmD2Vv18OQVn-cP2dhoHPX \
//   --private-key <private_key> \
//   --broadcast

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {PoolManager} from "v4-core/PoolManager.sol";
import {PoolSwapTest} from "v4-core/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/test/PoolModifyLiquidityTest.sol";
import {PoolDonateTest} from "v4-core/test/PoolDonateTest.sol";
import {PoolTakeTest} from "v4-core/test/PoolTakeTest.sol";
import {PoolClaimsTest} from "v4-core/test/PoolClaimsTest.sol";

contract V4Deployer is Script {
    function run() public {
        vm.startBroadcast();

        // Deploying the PoolManager and associated Pool routers on Cardona zkEVM
        PoolManager manager = new PoolManager();
        PoolSwapTest swapRouter = new PoolSwapTest(manager);
        PoolModifyLiquidityTest modifyLiquidityRouter = new PoolModifyLiquidityTest(
            manager
        );
        PoolDonateTest donateRouter = new PoolDonateTest(manager);
        PoolTakeTest takeRouter = new PoolTakeTest(manager);
        PoolClaimsTest claimsRouter = new PoolClaimsTest(manager);

        ERC20Mock token = new ERC20Mock("MockSteelo", "mSTLO", 18);
        token.mint(address(this), 1_000_000 * 10 ** 18);

        vm.stopBroadcast();
    }
}
