/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEELOTransactionFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEELOTransactionFacet = await ethers.getContractFactory('STEELOTransactionFacet')
    const steeloTransactionFacet = await STEELOTransactionFacet.deploy()

    console.log('Deployed steeloTransactionFacet to ', steeloTransactionFacet.address)

    let addresses = [];
    addresses.push(steeloTransactionFacet.address)
    let selectors = getSelectors(steeloTransactionFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steeloTransactionFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steeloTransactionFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steeloTransactionFacet Added To Diamond");
    return steeloTransactionFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEELOTransactionFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEELOTransactionFacet = deploySTEELOTransactionFacet
