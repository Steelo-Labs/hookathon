/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZDataBaseFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZDataBaseFacet = await ethers.getContractFactory('STEEZDataBaseFacet')
    const steezDataBaseFacet = await STEEZDataBaseFacet.deploy()

    console.log('Deployed steezDataBaseFacet to ', steezDataBaseFacet.address)

    let addresses = [];
    addresses.push(steezDataBaseFacet.address)
    let selectors = getSelectors(steezDataBaseFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezDataBaseFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezDataBaseFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezDataBaseFacet Added To Diamond");
    return steezDataBaseFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZDataBaseFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZDataBaseFacet = deploySTEEZDataBaseFacet
