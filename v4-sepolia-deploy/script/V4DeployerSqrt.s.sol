// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {PoolManager} from "v4-core/PoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import "forge-std/console.sol";

contract V4DeployerSqrt is Script {
    PoolManager manager;
    

    function setUp() public {
        manager = new PoolManager();
    }

    function run() public {
        vm.startBroadcast();

        // Define tokens and pool parameters
        address tokenA = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;  
        address tokenB = 0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0;  
        uint24 fee = 3000;  // Fee in basis points, e.g., 0.30%
        int24 tickSpacing = 60;  // Example tick spacing
        uint160 sqrtPriceX96 = uint160(sqrt(2) * 2**96); // Adjusted to a more typical 1:1 price ratio for illustration

        // Create PoolKey
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(tokenA),
            currency1: Currency.wrap(tokenB),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0)) // Assuming no hooks; replace if needed
        });

        // Initialize the pool
        manager.initialize(key, sqrtPriceX96, "");
        console.log(address(manager));
        vm.stopBroadcast();
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
        
}
