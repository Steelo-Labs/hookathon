/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZPreOrderFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZPreOrderFacet = await ethers.getContractFactory('STEEZPreOrderFacet')
    const steezPreOrderFacet = await STEEZPreOrderFacet.deploy()

    console.log('Deployed steezPreOrderFacet to ', steezPreOrderFacet.address)

    let addresses = [];
    addresses.push(steezPreOrderFacet.address)
    let selectors = getSelectors(steezPreOrderFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezPreOrderFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezPreOrderFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezPreOrderFacet Added To Diamond");
    return steezPreOrderFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZPreOrderFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZPreOrderFacet = deploySTEEZPreOrderFacet
