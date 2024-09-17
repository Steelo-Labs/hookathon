// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

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
import {TickMath} from "v4-core/libraries/TickMath.sol";
import "forge-std/console.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}
  

contract Swap is Script {
    PoolManager public manager;
    IERC20 public tokenA;
    IERC20 public tokenB;
    PoolModifyLiquidityTest public modifyLiquidityRouter;
    PoolSwapTest public swapRouter;
    PoolKey public key;

    bytes public ZERO_BYTES = new bytes(0);
    uint160 public constant MIN_PRICE_LIMIT = TickMath.MIN_SQRT_PRICE + 1;
    uint160 public constant MAX_PRICE_LIMIT = TickMath.MAX_SQRT_PRICE - 1;
    

    function setUp() public {
        manager = PoolManager(address(0xE9767C91c1546B0e89d757044b6045c6fb69AB38));
        tokenA = IERC20(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9);
        tokenB = IERC20(0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0);

        uint24 fee = 3000;  // Fee in basis points, e.g., 0.30%
        int24 tickSpacing = 60;  // Example tick spacing
        uint160 sqrtPriceX96 = uint160(sqrt(2) * 2**96); // Adjusted to a more typical 1:1 price ratio for illustration

        // Create PoolKey
        key = PoolKey({
            currency0: Currency.wrap(address(tokenA)),
            currency1: Currency.wrap(address(tokenB)),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0)) // Assuming no hooks; replace if needed
        });

        // Instance of a test router for modifying liquidity
        modifyLiquidityRouter = PoolModifyLiquidityTest(address(0x5cB77dF5efAB7568e13dB1e341BC0d44e08f40f9));
    }

    function run() public {
        vm.startBroadcast();

        

        swapRouter = new PoolSwapTest(manager);

         
        IERC20(tokenA).approve(address(swapRouter), type(uint256).max);
        IERC20(tokenB).approve(address(swapRouter), type(uint256).max);

         bool zeroForOne = true;
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: 10 * 1e5,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });

        PoolSwapTest.TestSettings memory testSettings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});

        bytes memory hookData = new bytes(0);
        swapRouter.swap(key, params, testSettings, hookData);

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
