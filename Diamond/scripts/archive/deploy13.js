/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZApprovalFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZApprovalFacet = await ethers.getContractFactory('STEEZApprovalFacet')
    const steezApprovalFacet = await STEEZApprovalFacet.deploy()

    console.log('Deployed steezApprovalFacet to ', steezApprovalFacet.address)

    let addresses = [];
    addresses.push(steezApprovalFacet.address)
    let selectors = getSelectors(steezApprovalFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezApprovalFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezApprovalFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezApprovalFacet Added To Diamond");
    return steezApprovalFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZApprovalFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZApprovalFacet = deploySTEEZApprovalFacet
