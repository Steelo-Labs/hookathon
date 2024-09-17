/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai');
require('dotenv').config();

// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEELOStakingFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEELOStakingFacet = await ethers.getContractFactory('STEELOStakingFacet')
    const steeloStakingFacet = await STEELOStakingFacet.deploy()

    console.log('Deployed steeloStakingFacet to ', steeloStakingFacet.address)

    let addresses = [];
    addresses.push(steeloStakingFacet.address)
    let selectors = getSelectors(steeloStakingFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steeloStakingFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steeloStakingFacet.address)
    assert.sameMembers(result, selectors)
    console.log("steeloStakingFacet Added To Diamond");
    return steeloStakingFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEELOStakingFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEELOStakingFacet = deploySTEELOStakingFacet
