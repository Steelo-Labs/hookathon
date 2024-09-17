// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibAppStorage.sol";
import "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibSteelo } from "../libraries/LibSteelo.sol";
import { AppConstants } from "../libraries/LibAppStorage.sol";

/**
 * @title STEELOEFacet
 * @dev This contract manages the STEELO token, including minting, burning, and transfer functions.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides various functionalities to interact with STEELO tokens,
 *         including minting, burning, and transfer operations.
 */
contract STEELOEFacet {
    AppStorage internal s;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        LibSteelo.initializeERC20(msg.sender);	 
        emit Transfer(address(0), s.owner, s.totalSupply);
    }

    function name() public view returns (string memory) {
        return AppConstants.STEELO_NAME;
    }

    function symbol() public view returns (string memory) {
        return AppConstants.STEELO_SYMBOL;
    }

    function decimals() public view returns (uint256) {
        return AppConstants.DECIMAL;
    }

    function totalSupply() public view returns (uint256) {
        return s.totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return s.balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "Transfer to the zero address");
        require(s.balances[msg.sender] >= amount, "Transfer amount exceeds balance");

        LibSteelo._transfer(msg.sender, recipient, amount);
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return s.allowance[owner][spender];
    }
   
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Approve to the zero address");

        LibSteelo._approve(msg.sender, spender, amount); 
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(sender != address(0), "Transfer from the zero address");
        require(recipient != address(0), "Transfer to the zero address");
        require(s.balances[sender] >= amount, "Transfer amount exceeds balance");
        require(s.allowance[sender][msg.sender] >= amount, "Transfer amount exceeds allowance");

        LibSteelo._transfer(sender, recipient, amount);
        LibSteelo._approve(sender, msg.sender, s.allowance[sender][msg.sender] - amount);
        return true;
    }

    function mint(uint256 amount) public {
        // require(msg.sender == s.owner, "Only the owner can mint");
        LibSteelo._mint(msg.sender, amount); 
        emit Transfer(address(0), msg.sender, amount);
    }
}
