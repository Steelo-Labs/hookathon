// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";

/**
 * @title DiamondCutFacet
 * @dev This contract is responsible for managing the diamond cut, which allows for the dynamic
 *      addition, replacement, or removal of functions in the diamond.
 *      It uses the Diamond Standard (EIP-2535) for modularity and upgradability.
 * 
 * @notice The contract provides a function to perform a diamond cut, which is a crucial part
 *         of the diamond standard for upgradable contracts.
 */
contract DiamondCutFacet is IDiamondCut {
    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}
