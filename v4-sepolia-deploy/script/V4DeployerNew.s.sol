// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "v4-core/PoolManager.sol";
import "v4-core/types/PoolKey.sol";
import "v4-core/types/Currency.sol";
import "v4-core/libraries/Hooks.sol";
import "v4-core/interfaces/IHooks.sol";
import "v4-core/test/PoolModifyLiquidityTest.sol";
import "forge-std/console.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract V4DeployerNew is Script {
    PoolManager public manager;
    IERC20 public tokenA;
    IERC20 public tokenB;
    PoolModifyLiquidityTest public modifyLiquidityRouter;
    PoolKey public key;

    bytes public ZERO_BYTES = new bytes(0);

    function setUp() public {
        manager = new PoolManager();
        
        // Token addresses, these should be replaced with the actual token contract addresses
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

        // Initialize the pool
        manager.initialize(key, sqrtPriceX96, "");

        // Instance of a test router for modifying liquidity
        modifyLiquidityRouter = new PoolModifyLiquidityTest(manager);
    }

    function run() public {
        vm.startBroadcast();

        require(tokenA.approve(address(modifyLiquidityRouter), 30 * 1e24), "TokenA approval failed");
        require(tokenB.approve(address(modifyLiquidityRouter), 30 * 1e24), "TokenB approval failed");

        // Modify liquidity
        modifyLiquidityRouter.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({
                tickLower: -60,
                tickUpper: 60,
                liquidityDelta: 10 * 1e10, // Adjust liquidity delta as needed
                salt: bytes32(0)
            }),
            ZERO_BYTES
        );

        vm.stopBroadcast();
        console.log("sender: ", msg.sender);
        console.log("Deployed LP Router: ", address(modifyLiquidityRouter));
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
