/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert, expect } = require('chai')




describe('DiamondTest', async function () {
  let diamondAddress
  let diamondCutFacet
  let diamondLoupeFacet
  let ownershipFacet
  let tx
  let receipt
  let result
  const addresses = []
  let owner, addr1, addr2, addr3, addr4, addr5, addr6;
  this.timeout(60000);

  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    diamondAddress = await deployDiamond()
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
    ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
  })

  it('should have three facets', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }

    assert.equal(addresses.length, 3)
  }).timeout(600000);
  it('add the SIP Facet', async () => {

      const SIPFacet = await ethers.getContractFactory('SIPFacet')
      const sipFacet = await SIPFacet.deploy()
  
      let selectors = getSelectors(sipFacet);
      let addresses = [];
      addresses.push(sipFacet.address);
      
      await diamondCutFacet.diamondCut([[sipFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

   it('propose a proposal from owner', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let title = "Tokenized Audience Engagement";
	let description = "By integrating a token bidding system, this proposal introduces a dynamic mechanism where viewers can use decentralized social media tokens (DSMT) to bid for premium content, early access, or exclusive interactions with creators.";
	let sipType = "Steelo Enhancement Proposal (SEP)";
  	await expect(SIP.connect(owner).proposeSIP(title, description, sipType)).to.not.be.reverted;

    })
    
    it('check if a proposal exists', async () => { 
  
      const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
      let proposal = await SIP.connect(owner).getSIPProposal(1);
      console.log(proposal);

    })

    it('propose a proposal from addr1', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let title = "Community Content Curation Proposal (CCCP)";
	let description = "The Community Content Curation Proposal aims to empower the platform’s community by giving token holders the ability to curate and elevate quality content through a decentralized voting mechanism. This proposal leverages the native social media token to enable democratic content curation, enhancing visibility for high-quality posts and rewarding active community participation.";
	let sipType = "Governance Proposal";
  	await expect(SIP.connect(addr1).proposeSIP(title, description, sipType)).to.not.be.reverted;

    })

    it('check all proposals', async () => { 
  
      const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
      let proposal = await SIP.connect(owner).getAllSIPProposal();
      console.log(proposal);

    })

    it('register a voter', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
  	await expect(SIP.connect(owner).registerVoter(1)).to.not.be.reverted;

    })

    it('get voter', async () => { 
  
      const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
      let voter = await SIP.connect(owner).getVoter(1);
      console.log(voter);

    })

    it('vote on SIP registered owner', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(owner).voteOnSip(1, vote)).to.not.be.reverted;

    })

    it('vote again on SIP registered owner', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(owner).voteOnSip(1, vote)).to.be.reverted;

    })

    it('vote on SIP not registered addr2', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(addr2).voteOnSip(1, vote)).to.be.reverted;

    })

    it('check if a proposa has been voted', async () => { 
  
      const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
      let proposal = await SIP.connect(owner).getSIPProposal(1);
      console.log(proposal.proposerRole, 
	      parseInt(proposal.voteCountForCommunity, 10),
	      parseInt(proposal.voteCountAgainstCommunity, 10)
      		);

    })

    it('register addr2 as voter', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
  	await expect(SIP.connect(addr2).registerVoter(1)).to.not.be.reverted;

    })

    it('change role of addr2', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
  	await expect(SIP.connect(addr2).roleChanger(1)).to.not.be.reverted;

    })

    it('vote on SIP registered addr2', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(addr2).voteOnSip(1, vote)).to.not.be.reverted;

    })

    it('SIP time ender', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
  	await expect(SIP.connect(owner).SIPTimeEnder(1)).to.not.be.reverted;

    })

    it('vote on SIP registered owner after SIP time ended', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(owner).voteOnSip(1, vote)).to.not.be.reverted;

    })

    it('must be reverted vote on SIP registered owner after SIP time ended again', async () => { 
  
	const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
	let vote = true;
  	await expect(SIP.connect(owner).voteOnSip(1, vote)).to.be.reverted;

    })


    it('check if a proposa has been executed', async () => { 
  
      const SIP = await ethers.getContractAt('SIPFacet', diamondAddress);
      let proposal = await SIP.connect(owner).getSIPProposal(1);
      console.log(proposal);

    })


    
 
	
});
