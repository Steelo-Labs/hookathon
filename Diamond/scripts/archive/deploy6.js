/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEEZLaunchFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEEZLaunchFacet = await ethers.getContractFactory('STEEZLaunchFacet')
    const steezLaunchFacet = await STEEZLaunchFacet.deploy()

    console.log('Deployed steezLaunchFacet to ', steezLaunchFacet.address)

    let addresses = [];
    addresses.push(steezLaunchFacet.address)
    let selectors = getSelectors(steezLaunchFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steezLaunchFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steezLaunchFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steezLaunchFacet Added To Diamond");
    return steezLaunchFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEEZLaunchFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEEZLaunchFacet = deploySTEEZLaunchFacet
