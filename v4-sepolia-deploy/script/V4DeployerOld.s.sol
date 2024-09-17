// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {PoolManager} from "v4-core/PoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {PoolSwapTest} from "v4-core/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/test/PoolModifyLiquidityTest.sol";
import {PoolDonateTest} from "v4-core/test/PoolDonateTest.sol";
import {PoolTakeTest} from "v4-core/test/PoolTakeTest.sol";
import {PoolClaimsTest} from "v4-core/test/PoolClaimsTest.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import "forge-std/console.sol";

contract V4DeployerOld is Script {
    using CurrencyLibrary for Currency;

    //addresses with contracts deployed
    address constant GOERLI_POOLMANAGER = address(0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141); //pool manager deployed to GOERLI
    address constant MUNI_ADDRESS = address(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9); //mUNI deployed to GOERLI -- insert your own contract address here
    address constant MUSDC_ADDRESS = address(0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238); //mUSDC deployed to GOERLI -- insert your own contract address here
    address constant HOOK_ADDRESS = address(0); //address of the hook contract deployed to goerli -- you can use this hook address or deploy your own!

    IPoolManager manager = IPoolManager(GOERLI_POOLMANAGER);

    function run() external {
        // sort the tokens!
        address token0 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUSDC_ADDRESS : MUNI_ADDRESS;
        address token1 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUNI_ADDRESS : MUSDC_ADDRESS;
        uint24 swapFee = 3000;
        int24 tickSpacing = 60;

        // floor(sqrt(1) * 2^96)
        uint160 startingPrice = 79228162514264337593543950336;

        bytes memory hookData = abi.encode(block.timestamp);

        PoolKey memory pool = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: swapFee,
            tickSpacing: tickSpacing,
            hooks: IHooks(HOOK_ADDRESS)
        });

        // Turn the Pool into an ID so you can use it for modifying positions, swapping, etc.
        PoolId id = PoolIdLibrary.toId(pool);
        bytes32 idBytes = PoolId.unwrap(id);

        console.log("Pool ID Below");
        console.logBytes32(bytes32(idBytes));

        vm.broadcast();
        manager.initialize(pool, startingPrice, hookData);
    }
}