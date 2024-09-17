/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployUSDTSwapperFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const USDTSwapperFacet = await ethers.getContractFactory('USDTSwapperFacet')
    const usdtSwapperFacet = await USDTSwapperFacet.deploy()

    console.log('Deployed usdtSwapperFacet to ', usdtSwapperFacet.address)

    let addresses = [];
    addresses.push(usdtSwapperFacet.address)
    let selectors = getSelectors(usdtSwapperFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: usdtSwapperFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(usdtSwapperFacet.address)
    assert.sameMembers(result, selectors)
    console.log("usdtSwapperFacet Added To Diamond");
    return usdtSwapperFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployUSDTSwapperFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployUSDTSwapperFacet = deployUSDTSwapperFacet
