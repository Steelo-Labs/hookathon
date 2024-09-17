/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();

// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployAccessControlFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet')
    const accessControlFacet = await AccessControlFacet.deploy()

    console.log('Deployed accessControlFacet to ', accessControlFacet.address)

    let addresses = [];
    addresses.push(accessControlFacet.address)
    let selectors = getSelectors(accessControlFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: accessControlFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(accessControlFacet.address)
    assert.sameMembers(result, selectors)
    console.log("accessControlFacet Added To Diamond");
    return accessControlFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployAccessControlFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployAccessControlFacet = deployAccessControlFacet
