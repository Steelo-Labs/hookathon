/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEELOAttributesFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEELOAttributesFacet = await ethers.getContractFactory('STEELOAttributesFacet')
    const steeloAttributesFacet = await STEELOAttributesFacet.deploy()

    console.log('Deployed steeloAttributesFacet to ', steeloAttributesFacet.address)

    let addresses = [];
    addresses.push(steeloAttributesFacet.address)
    let selectors = getSelectors(steeloAttributesFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steeloAttributesFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steeloAttributesFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steeloAttributesFacet Added To Diamond");
    return steeloAttributesFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEELOAttributesFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEELOAttributesFacet = deploySTEELOAttributesFacet
