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
  let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9;
  this.timeout(60000);

  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9] = await ethers.getSigners();
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
   it('add the Access Control Facet', async () => {

      const AccessControlFacet = await ethers.getContractFactory('AccessControlFacet')
      const accessControlFacet = await AccessControlFacet.deploy()
  
      let selectors = getSelectors(accessControlFacet);
      let addresses = [];
      addresses.push(accessControlFacet.address);
      
      await diamondCutFacet.diamondCut([[accessControlFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

  
    it('initialize the access where by grants role to the executive', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
  	await expect(AccessControl.connect(owner).initialize()).to.not.be.reverted;

    })

    it('check out the role of your address', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(owner).getRole( owner.address );
      console.log("role of owner address :", role);

    })
    
    it('initialize the access again where by grants role to the executive', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
  	await expect(AccessControl.connect(owner).initialize()).to.be.reverted;

    })

    

    it('executive owner grant role admin to addr1', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr1.address)).to.not.be.reverted;

    })

    it('check out the role of your address', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr1).getRole( addr1.address );
      console.log("role of addr1 address :", role);

    })
     
    

    it('executive owner grant role admin to addr2', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr2.address)).to.not.be.reverted;

    })

    it('check out the role of addr2 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr2).getRole( addr2.address );
      console.log("role of addr2 address :", role);

    })
     
    
    it('executive owner grant role admin to addr3', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr3.address)).to.not.be.reverted;

    })

    it('check out the role of addr3 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr3).getRole( addr3.address );
      console.log("role of addr3 address :", role);

    })
     
    
    it('executive owner grant role admin to addr4', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr4.address)).to.not.be.reverted;

    })

    it('check out the role of addr4 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr4).getRole( addr4.address );
      console.log("role of addr4 address :", role);

    })
     
    
    it('executive owner grant role admin to addr5', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr5.address)).to.not.be.reverted;

    })

    it('check out the role of addr5 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr5).getRole( addr5.address );
      console.log("role of addr5 address :", role);

    })
     
   

    it('check out the role of addr6', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr6).getRole( addr6.address);
      console.log("role of addr6 address :", role);

    })
  it('should add the Steelo Facet', async () => {

      const SteeloFacet = await ethers.getContractFactory('STEELOStakingFacet')
      const steeloFacet = await SteeloFacet.deploy()
  
      let selectors = getSelectors(steeloFacet);
      let addresses = [];
      addresses.push(steeloFacet.address);
      
      await diamondCutFacet.diamondCut([[steeloFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

   it('should add the Steelo3 Facet', async () => {

      const Steelo3Facet = await ethers.getContractFactory('STEELOAttributesFacet')
      const steelo3Facet = await Steelo3Facet.deploy()
  
      let selectors = getSelectors(steelo3Facet);
      let addresses = [];
      addresses.push(steelo3Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo3Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)


   it('should add the Steelo4 Facet', async () => {

      const Steelo4Facet = await ethers.getContractFactory('ProfileFacet')
      const steelo4Facet = await Steelo4Facet.deploy()
  
      let selectors = getSelectors(steelo4Facet);
      let addresses = [];
      addresses.push(steelo4Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo4Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
       it('should add the Steelo5 Facet', async () => {

      const Steelo5Facet = await ethers.getContractFactory('STEELOTransactionFacet')
      const steelo5Facet = await Steelo5Facet.deploy()
  
      let selectors = getSelectors(steelo5Facet);
      let addresses = [];
      addresses.push(steelo5Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo5Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
   
   it('addr1 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "abcd0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr1).createSteeloUser(profileId)).to.not.be.reverted;

    })
    it('addr2 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "bcde0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr2).createSteeloUser(profileId)).to.not.be.reverted;

    })
    it('addr3 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "cdef0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr3).createSteeloUser(profileId)).to.not.be.reverted;

    })
    it('addr4 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "defg0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr4).createSteeloUser(profileId)).to.not.be.reverted;

    })
    it('addr5 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "efgh0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr5).createSteeloUser(profileId)).to.not.be.reverted;

    })


   it('addr6 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "1ugs0SRpjX9dD4hSi6rB";
      await expect(Steelo4.connect(addr6).createSteeloUser(profileId)).to.not.be.reverted;

    })
   
    it('addr7 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "Fhpz1LyFSXytoMG8MQa4";
      await expect(Steelo4.connect(addr7).createSteeloUser(profileId)).to.not.be.reverted;

    })

    it('addr8 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "HX7A43WejtSY7T93Vor7";
      await expect(Steelo4.connect(addr8).createSteeloUser(profileId)).to.not.be.reverted;

    })

    it('addr9 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = "OJBnZxWJe2oflQXZG8FE";
      await expect(Steelo4.connect(addr9).createSteeloUser(profileId)).to.not.be.reverted;

    })



   it('should initiate Steelo from addr1 must be rejected', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      await expect(Steelo.connect(addr1).steeloInitiate()).to.be.reverted;

    })

   it('should initiate Steelo from owner executive', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloInitiate()).to.not.be.reverted;

    })

   it('should check name of Steelo coin name is Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let name = await Steelo.steeloName()
      expect(name).to.equal("Steelo");

    })

   

   
    it('should fail to check name of Steelo coin name is Ezra', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let name = await Steelo.steeloName()
      expect(name).to.not.equal("Ezra");

    })

    it('should check name of Steelo coin symbol is STH', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let symbol = await Steelo.steeloSymbol()
      expect(symbol).to.equal("STLO");

    })
    it('should fail to check name of Steelo coin symbol is ETH', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let symbol = await Steelo.steeloSymbol()
      expect(symbol).to.not.equal("ETH");

    })
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
      let voter = await SIP.connect(owner).getVoter(1, owner.address);
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
  	await expect(SIP.connect(addr2).roleChanger(1, addr2.address)).to.not.be.reverted;

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
