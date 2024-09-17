/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZCollaboratorFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZCollaboratorFacet = await ethers.getContractFactory('STEEZCollaboratorFacet')
    const steezCollaboratorFacet = await STEEZCollaboratorFacet.deploy()

    console.log('Deployed steezCollaboratorFacet to ', steezCollaboratorFacet.address)

    let addresses = [];
    addresses.push(steezCollaboratorFacet.address)
    let selectors = getSelectors(steezCollaboratorFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezCollaboratorFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezCollaboratorFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezCollaboratorFacet Added To Diamond");
    return steezCollaboratorFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZCollaboratorFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZCollaboratorFacet = deploySTEEZCollaboratorFacet
