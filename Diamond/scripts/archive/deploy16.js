/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployCollectibleContentFacet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const CollectibleContentFacet = await ethers.getContractFactory('CollectibleContentFacet')
    const collectibleContentFacet = await CollectibleContentFacet.deploy()

    console.log('Deployed collectibleContentFacet to ', collectibleContentFacet.address)

    let addresses = [];
    addresses.push(collectibleContentFacet.address)
    let selectors = getSelectors(collectibleContentFacet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: collectibleContentFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(collectibleContentFacet.address)
    assert.sameMembers(result, selectors)
    console.log("collectibleContentFacet Added To Diamond");
    return collectibleContentFacet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deployCollectibleContentFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySteez8FaceCollectibleContentFacett = deployCollectibleContentFacet
