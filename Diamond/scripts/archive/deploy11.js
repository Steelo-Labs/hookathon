/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZCreatorFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZCreatorFacet = await ethers.getContractFactory('STEEZCreatorFacet')
    const steezCreatorFacet = await STEEZCreatorFacet.deploy()

    console.log('Deployed steezCreatorFacet to ', steezCreatorFacet.address)

    let addresses = [];
    addresses.push(steezCreatorFacet.address)
    let selectors = getSelectors(steezCreatorFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezCreatorFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezCreatorFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezCreatorFacet Added To Diamond");
    return steezCreatorFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZCreatorFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZCreatorFacet = deploySTEEZCreatorFacet
