/* global ethers */
/* eslint prefer-const: "off" */
const { assert, expect } = require('chai')
require('dotenv').config();
// const { deployDiamond } = require('./deploy2.js')

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deploySTEELOERC20Facet () {
    // diamondAddress = await deployDiamond()
    
    diamondAddress = process.env.DIAMOND_ADDRESS;
    console.log("diamondAddress", diamondAddress);

    const STEELOERC20Facet = await ethers.getContractFactory('STEELOERC20Facet')
    const steeloERC20Facet = await STEELOERC20Facet.deploy()

    console.log('Deployed steeloERC20Facet to ', steeloERC20Facet.address)

    let addresses = [];
    addresses.push(steeloERC20Facet.address)
    let selectors = getSelectors(steeloERC20Facet)

    const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondAddress)
    const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)

    tx = await diamondCutFacet.diamondCut(
    [{
        facetAddress: steeloERC20Facet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(steeloERC20Facet.address)
    assert.sameMembers(result, selectors)
    console.log("steeloERC20Facet Added To Diamond");
    return steeloERC20Facet.address;

}

// We recommend this pattern to be able to use async/await every where
// and properly handle errors.
if (require.main === module) {
    deploySTEELOERC20Facet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deploySTEELOERC20Facet = deploySTEELOERC20Facet
