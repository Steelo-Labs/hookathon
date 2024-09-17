/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployProfileFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const ProfileFacet = await ethers.getContractFactory('ProfileFacet')
    const profileFacet = await ProfileFacet.deploy()

    console.log('Deployed profileFacet to ', profileFacet.address)

    let addresses = [];
    addresses.push(profileFacet.address)
    let selectors = getSelectors(profileFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: profileFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(profileFacet.address)
    assert.sameMembers(result, selectors)
    console.log("profileFacet Added To Diamond");
    return profileFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployProfileFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployProfileFacet = deployProfileFacet
