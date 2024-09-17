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

  function formatTimestampToDate(timestamp) {
    // Convert timestamp to milliseconds
    const date = new Date(timestamp * 1000);
    
    // Extract date components
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const year = date.getFullYear();
    
    // Format the date
    const formattedDate = `${dayOfWeek}, ${day}, ${month}, ${year}`;
    
    return formattedDate;
}

  it('should have three facets', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }

    assert.equal(addresses.length, 3)
  }).timeout(600000);
   
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

     it('executive owner grant role admin to addr1', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr1.address)).to.not.be.reverted;

    })

    it('check out the role of your address', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr1).getRole( addr1.address);
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
      let role = await AccessControl.connect(addr6).getRole( addr6.address );
      console.log("role of addr6 address :", role);

    })


  it('should add the Steez Facet', async () => {

      const SteezFacet = await ethers.getContractFactory('STEEZPreOrderFacet')
      const steezFacet = await SteezFacet.deploy()
  
      let selectors = getSelectors(steezFacet);
      let addresses = [];
      addresses.push(steezFacet.address);
      
      await diamondCutFacet.diamondCut([[steezFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

   it('Add the Steez2 Facet', async () => {

      const Steez2Facet = await ethers.getContractFactory('STEEZLaunchFacet')
      const steez2Facet = await Steez2Facet.deploy()
  
      let selectors = getSelectors(steez2Facet);
      let addresses = [];
      addresses.push(steez2Facet.address);
      
      await diamondCutFacet.diamondCut([[steez2Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
    
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

it('add the Village Facet', async () => {

      const VillageFacet = await ethers.getContractFactory('VillageFacet')
      const villageFacet = await VillageFacet.deploy()
  
      let selectors = getSelectors(villageFacet);
      let addresses = [];
      addresses.push(villageFacet.address);
      
      await diamondCutFacet.diamondCut([[villageFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
    

    it('Add the Steez3 Facet', async () => {

      const Steez3Facet = await ethers.getContractFactory('STEEZDataBaseFacet')
      const steez3Facet = await Steez3Facet.deploy()
  
      let selectors = getSelectors(steez3Facet);
      let addresses = [];
      addresses.push(steez3Facet.address);
      
      await diamondCutFacet.diamondCut([[steez3Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

    it('Add the Steez4 Facet', async () => {

      const Steez4Facet = await ethers.getContractFactory('STEEZCreatorFacet')
      const steez4Facet = await Steez4Facet.deploy()
  
      let selectors = getSelectors(steez4Facet);
      let addresses = [];
      addresses.push(steez4Facet.address);
      
      await diamondCutFacet.diamondCut([[steez4Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

    it('Add the Steez5 Facet', async () => {

      const Steez5Facet = await ethers.getContractFactory('STEEZApprovalFacet')
      const steez5Facet = await Steez5Facet.deploy()
  
      let selectors = getSelectors(steez5Facet);
      let addresses = [];
      addresses.push(steez5Facet.address);
      
      await diamondCutFacet.diamondCut([[steez5Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)


    it('Add the Steez6 Facet', async () => {

      const Steez6Facet = await ethers.getContractFactory('STEEZP2PFacet')
      const steez6Facet = await Steez6Facet.deploy()
  
      let selectors = getSelectors(steez6Facet);
      let addresses = [];
      addresses.push(steez6Facet.address);
      
      await diamondCutFacet.diamondCut([[steez6Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)


    it('Add the Steez7 Facet', async () => {

      const Steez7Facet = await ethers.getContractFactory('STEEZAnniversaryFacet')
      const steez7Facet = await Steez7Facet.deploy()
  
      let selectors = getSelectors(steez7Facet);
      let addresses = [];
      addresses.push(steez7Facet.address);
      
      await diamondCutFacet.diamondCut([[steez7Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)



    it('Add the Steez8 Facet', async () => {

      const Steez8Facet = await ethers.getContractFactory('CollectibleContentFacet')
      const steez8Facet = await Steez8Facet.deploy()
  
      let selectors = getSelectors(steez8Facet);
      let addresses = [];
      addresses.push(steez8Facet.address);
      
      await diamondCutFacet.diamondCut([[steez8Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

    it('Add the Steez9 Facet', async () => {

      const Steez9Facet = await ethers.getContractFactory('STEEZPercentageFacet')
      const steez9Facet = await Steez9Facet.deploy()
  
      let selectors = getSelectors(steez9Facet);
      let addresses = [];
      addresses.push(steez9Facet.address);
      
      await diamondCutFacet.diamondCut([[steez9Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

    it('Add the Steez10 Facet', async () => {

      const Steez9Facet = await ethers.getContractFactory('STEEZCollaboratorFacet')
      const steez9Facet = await Steez9Facet.deploy()
  
      let selectors = getSelectors(steez9Facet);
      let addresses = [];
      addresses.push(steez9Facet.address);
      
      await diamondCutFacet.diamondCut([[steez9Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

it('should add the Steelo 4 Facet', async () => {

      const Steelo4Facet = await ethers.getContractFactory('ProfileFacet')
      const steelo4Facet = await Steelo4Facet.deploy()
  
      let selectors = getSelectors(steelo4Facet);
      let addresses = [];
      addresses.push(steelo4Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo4Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

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

   it('should initiate Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloInitiate()).to.not.be.reverted;

    })

    it('should go with Steelo Token Generation', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloTGE()).to.not.be.reverted;

    })

	it('should add the Steelo 2 Facet', async () => {

      const Steelo2Facet = await ethers.getContractFactory('STEELOAdminFacet')
      const steelo2Facet = await Steelo2Facet.deploy()
  
      let selectors = getSelectors(steelo2Facet);
      let addresses = [];
      addresses.push(steelo2Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo2Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

    it('should add the Steelo 3 Facet', async () => {

      const Steelo3Facet = await ethers.getContractFactory('STEELOAttributesFacet')
      const steelo3Facet = await Steelo3Facet.deploy()
  
      let selectors = getSelectors(steelo3Facet);
      let addresses = [];
      addresses.push(steelo3Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo3Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
    

    it('should add the Steelo 5 Facet', async () => {

      const Steelo5Facet = await ethers.getContractFactory('STEELOTransactionFacet')
      const steelo5Facet = await Steelo5Facet.deploy()
  
      let selectors = getSelectors(steelo5Facet);
      let addresses = [];
      addresses.push(steelo5Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo5Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
     
    


//   it('should initiate Steez', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
//  	await expect(Steez.connect(owner).steezInitiate()).to.not.be.reverted;
//
//    })


//   it('should check name of Steez token name is Steez', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
//      let name = await Steelo.creatorTokenName()
//      expect(name).to.equal("Steez");
//
//    })

   

   
    it('should fail to check name of Steelo coin name is Ezra', async () => { 
  
      const Steelo = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
      let name = await Steelo.creatorTokenName()
      expect(name).to.not.equal("Ezra");

    })

//    it('should check name of Steelo coin symbol is STZ', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
//      let symbol = await Steelo.creatorTokenSymbol()
//      expect(symbol).to.equal("STZ");
//
//    })
//    it('should fail to check name of Steelo coin symbol is ETH', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
//      let symbol = await Steelo.creatorTokenSymbol()
//      expect(symbol).to.not.equal("ETH");
//
//    })

    it('create a Creator Account', async () => { 
  
	    try {
		const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
		profileId = "fvG74d0z271TuaE6WD2t";
   		await Steez2.connect(owner).createCreator(profileId);
		console.log("Creator Account Created Successulyy");
	    }
	    catch (error) {
		console.error("Creator Account Did not create successully :", error.message);
	    }

    })

    it('should create Steez', async () => { 
  
	    try {
		const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
   		await Steez.connect(owner).createSteez();
		console.log("Steez Created Successulyy");
	    }
	    catch (error) {
		console.error("Steez Did not create successully :", error.message);
	    }

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      	const creators = await Steez.getAllCreator(creatorId);
      	console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check creators data created part 2', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator2(creatorId);
      console.log("auction start time :", parseInt(creators[0], 10),"auction anniversery :", parseInt(creators[1], 10),"auction concluded :", creators[2]);

    })

    it('should check creators data created part 3 before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator3(creatorId);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })
    it('should create Steez Again', async () => { 
  
	try {
		const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
   		await Steez.connect(owner).createSteez();
		console.log("Transaction Succeded");
	}
	    catch (error) {
		console.log("Transaction failed :", error.message);
	    }

    })


//    it('should create Steez again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
//   	await expect(Steez.connect(owner).createSteez()).to.not.be.reverted;
//
//    })

//    it('should check all creators created again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
//      const creators = await Steez.getAllCreatorIds();
//      expect(parseInt(creators, 10)).to.equal(2);
//      expect(parseInt(creators, 10)).to.not.equal(1);
//
//    })

      
   


    it('Steez Status', async() => {
  
	const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const steezStatus = await Steelo4.connect(addr2).steezStatus(creatorId);
	console.log("Steez Status:", steezStatus);
	
    })
    


    it('should preorder steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	await expect(Steez.connect(owner).initializePreOrder(creatorId)).to.not.be.reverted;

    })


    it('should check creators data created part 3 after', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator3(creatorId);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })

    it('should fail to preorder steez again', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	await expect(Steez.connect(owner).initializePreOrder(creatorId)).to.be.reverted;

    })

//    it('should check auction slots secured of a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const auctions = await Steez.getAuctionSlotsSecured(1, 1);
//      expect(parseInt(auctions, 10)).to.equal(2);
//      expect(parseInt(auctions, 10)).to.not.equal(0);
//
//    })

//    it('should check creator of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const creator = await Steez.getSteezCreatorAddress(1, 1);
//      expect(creator.toString()).to.equal("0x969De22db9fBBaa64C085E76ce2E954eF531BF25");
//      expect(creator.toString()).to.not.equal("0x0");
//
//    })

//    it('should check total supply of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const creator = await Steez.getTotalSteezs(1, 1);
//      expect(parseInt(creator, 10)).to.equal(500);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })

//    it('should check current price of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const creator = await Steez.getSteezsPrice(1, 1);
//      expect(parseInt(creator, 10)).to.equal(2);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })

//    it('should check amount possessed of a cretor in steez', async () => { 
//  
//      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const creator = await Steez.getSteezAmount(1, 1);
//      console.log((parseInt(creator, 10)));
//      expect(parseInt(creator, 10)).to.equal(2);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })


//    it('should check anniversaru', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//   	await expect(Steez.connect(owner).anniversary(1, 1, 10)).to.not.be.reverted;
//
//    })





      

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

      it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr1).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000000);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      console.log("Balance of address 1 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(1000);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })


    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr2).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000000);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(1000);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 2;
      await expect(Steelo.connect(addr3).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 3;
      await expect(Steelo.connect(addr4).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr5).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })


    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr6).stakeSteelo({value: ethers.utils.parseEther("5")})).to.not.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Buy addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Buy addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Buy addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Buy addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Buy addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Buy addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    

    
    
//    it('should bid preorder 2', async () => { 
//  
//      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
//      let num = 100;
//      let amount = ethers.utils.parseEther(num.toString());
//      let creatorId = "fvG74d0z271TuaE6WD2t";
//      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.not.be.reverted;
//
//    })

    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 20;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      console.log("Balance of address 1 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(1000);
      expect(parseInt(balance, 10)).to.not.equal(100);

    })

    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));


    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 20;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('addr1 bid 33 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 33;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
    
    it('addr2 bid 30 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 30;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr2).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })


    it('addr3 bid 31 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 31;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr3).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
	

    })
    it('addr4 4 bid 36 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 36;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr4).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
 
    it('addr5 bid 34 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 34;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr6 bid 40 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 40;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr2 bid 42 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 42;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr2).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr3 bid 31 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 40;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr3).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr1 bid 44 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 44;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr5 bid 46 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 46;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })


    it('addr4 4 bid 50 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 50;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr4).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('addr6 bid 50 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 50;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Preorder addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Preorder addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Preorder addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Preorder addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Preorder addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })
    
    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Preorder addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })


    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("addr1 balance after bid again:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr1 after bid again :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const balance = await Steez.connect(addr1).FirstAndLast(creatorId);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkBidAmount(creatorId, addr2.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check investors balance', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const balance = await Steez.checkInvestors(creatorId);
      console.log("investor length :", parseInt(balance[0], 10),"steelo Invested :", parseInt(balance[1], 10),"time invested :", parseInt(balance[2]), "address of investor :", balance[3].toString());

    })


//    it('should check equality', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const equality = await Steez.equality();
//      console.log("eqaulity :", equality);
//
//    })

    




    it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })


    

    
     

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 30;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.be.reverted;

    })
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 39;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkBidAmount(creatorId, addr4.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkBidAmount(creatorId, addr4.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

//    it('should check to be popped index', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//      const index = await Steez.getPopIndex();
//      console.log("popping index :", parseInt(index[0]), "poppin address :", index[1].toString(), "popping price :", parseInt(index[2], 10));
//
//    })

//    it('should check to be popped index', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress);
//	let creatorId = "fvG74d0z271TuaE6WD2t";
//     const index = await Steez.getPopData(creatorId);
//      console.log("pop amount :", parseInt(index[0], 10), "pop address :", index[1].toString());
//
//    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

 //   it('should bid preorder 6', async () => { 
 // 
 //     const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
 //     let amount = 62;
 //     await expect(Steez.connect(addr6).bidPreOrder(0, amount )).to.not.be.reverted;
//
//    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkBidAmount(creatorId, addr6.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2], 10), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('preorder ender', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).PreOrderEnder(creatorId)).to.not.be.reverted;

    })

    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })

     it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZPreOrderFacet', diamondAddress)
      let num = 30;
      let amount = ethers.utils.parseEther(num.toString());
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.be.reverted;

    })
    it('Steelo Current Price:', async () => { 
  
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress)
      let price = await Steelo4.connect(addr1).steeloPrice();
      price /= 10 ** 6;
      console.log("Steelo Price Before :", parseFloat(price));

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId, addr1.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

     it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })

    it('addr1 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr1).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('addr1 accepting preorder bid again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr1).AcceptOrReject(creatorId, true )).to.be.reverted;

    })

    it('addr2 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr2).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('addr3 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr3).AcceptOrReject(creatorId, true )).to.be.reverted;

    })
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId, addr1.address );
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId, addr5.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    

    it('addr4 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr4).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId, addr5.address);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address );
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

//    it('should accept or reject after preorder 6 first', async () => { 
//  
//      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
//      await expect(Steez.connect(addr6).AcceptOrReject(0, true )).to.not.be.reverted;
//
//    })

    it('should accept or reject after preorder 6 again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr6).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })
    it('should accept or reject after preorder 6 again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez.connect(addr6).AcceptOrReject(creatorId, true )).to.be.reverted;

    })

    

    it('addr5 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZApprovalFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })

    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })

    it('Launch Starter add minus 1 week of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
        await expect(Steez2.connect(addr6).launchStarter(creatorId)).to.not.be.reverted;

    })


    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })

    


     

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Approval addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Approval addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Approval addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Approval addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Approval addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Approval addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address);
	console.log("bid Amount :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })
 

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const balance = await Steez.connect(addr1).FirstAndLast(creatorId);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10) / (10 ** 18));

    })
    

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr1).stakeSteelo({value: ethers.utils.parseEther("3")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr6).stakeSteelo({value: ethers.utils.parseEther("3")})).to.not.be.reverted;

    })


//    it('Add the Steez2 Facet', async () => {
//
//      const Steez2Facet = await ethers.getContractFactory('STEEZLaunchFacet')
//      const steez2Facet = await Steez2Facet.deploy()
//  
//      let selectors = getSelectors(steez2Facet);
//      let addresses = [];
//      addresses.push(steez2Facet.address);
//      
//      await diamondCutFacet.diamondCut([[steez2Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
//  
//      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
//      assert.sameMembers(result, selectors)
//  
//    }).timeout(600000)


    it('addr6 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address);
	console.log("bid Amount should be 0:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 5:", parseInt(balance[4], 10));
	

    })

 it('Steez Status', async() => {
  
	const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const steezStatus = await Steelo4.connect(addr2).steezStatus(creatorId);
	console.log("Steez Status:", steezStatus);
	
    })
    

    


it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address);
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Approval addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Approval addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Approval addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Approval addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Approval addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Approval addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })

    it('Launch Starter add minus 1 week of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).launchStarter(creatorId)).to.not.be.reverted;

    })
    
    it('Launch Starter add minus 1 week of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).launchStarter(creatorId)).to.not.be.reverted;

    })
 
        it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));   

	})
    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr6 :", parseFloat(balance));

     })


    it('addr6 bid launch 1 steez', async () => { 
  	
	try {
        	const Steez2 = await ethers.getContractAt('STEEZLaunchFacet', diamondAddress)
		let creatorId = "fvG74d0z271TuaE6WD2t";
        	await Steez2.connect(addr6).bidLaunch(creatorId, 1 );
		console.log("transaction successfull");
	} catch (error) {
		console.log("transaction failed :", error.message);
    }      


    })


    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr6 :", parseFloat(balance));
   })


    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10)); 
	
	})
    

    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId, addr1.address);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 4:", parseInt(balance[4], 10));
    });
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    
    
    it('addr1 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZLaunchFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr1).bidLaunch(creatorId, 4 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })


    it('addr1 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZLaunchFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).bidLaunch(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
   
    it('addr6 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZLaunchFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).bidLaunch(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Launch addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Launch addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Launch addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Launch addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Launch addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Launch addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })


    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })
    

    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId, addr1.address);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 4:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('addr6 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address );
	console.log("bid Amount should be 34:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('current price after two bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("total supply:",parseInt(creators[1], 10), "current price after 2 bid launch:", parseInt(creators[2], 10) / (10 ** 18));


  });

   it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })


it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Launch addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Launch addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Launch addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Launch addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Launch addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Launch addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })
  

  it('addr1 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 54;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr1).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr2 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 56;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr2).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr3 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 57;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr3).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr4 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 58;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr4).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr5 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 59;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr5).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });
    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers);


  });


	it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId, addr5.address);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address );
	console.log("steez invested of addr6:", parseInt(balance[3], 10));
    });

	it('steelo balance of addr6', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('steelo balance of addr5', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr5.address);
      console.log("Balance of address 5 :", parseInt(balance, 10) / (10 ** 18));

    })

     it('should check investors length before p2pbuy', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

   it('see all Steez transaction', async() => {
  
	const Steez4 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const transaction = await Steez4.connect(addr2).returnSteezTransaction(creatorId);
	console.log(" Steez Transaction:", parseFloat(transaction));
	
    })
   
    it('liquidity provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("liquidity provider steelo balance :", parseFloat(balance));

    })

     it('ecosystem provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("ecosystem provider steelo balance :", parseFloat(balance));

    })

  



  it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 59;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 57;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 56;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 57;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

   it('addr6 P2P sell 2 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 70;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 2;
		await Steez2.connect(addr6).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

   

   

   it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 56;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

   it('addr2 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 70;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr2).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    
     it('addr3 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
	let num = 70;
      	let amount = ethers.utils.parseEther(num.toString());
	let size = 1;
	await Steez2.connect(addr3).P2PBuy(creatorId, amount, size);
      	console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    

    

    it('should check investors length after p2p buy', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId, addr5.address);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address);
	console.log("steez invested of addr6:", parseInt(balance[3], 10));
    });
   

	it('steelo balance of addr6', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('steelo balance of addr5', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr5.address);
      console.log("Balance of address 5 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });

	it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers);


  });


   it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })

   it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr9).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })
   
    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr7).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })
     it('stake period ender for addr9', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 1;
      await expect(Steelo2.connect(addr9).stakePeriodEnder(month)).to.not.be.reverted;

    })
     it('stake period ender for addr2', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 2;
      await expect(Steelo2.connect(addr2).stakePeriodEnder(month)).to.not.be.reverted;

    })
    it('stake period ender for addr7', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 3;
      await expect(Steelo2.connect(addr7).stakePeriodEnder(month)).to.not.be.reverted;

    })
   
    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr9).getStakedBalance( addr9.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr9:", parseFloat(balance));

    })

   
   it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr9.address);
      balance /= 10 ** 18;
      console.log("addr9 balance before unstaking :", parseFloat(balance));

    })


    

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })

    it('Steelo Current Price:', async () => { 
  
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress)
      let price = await Steelo4.connect(addr1).steeloPrice();
      price /= 10 ** 6;
      console.log("Steelo Price Before :", parseFloat(price));

    })

    it('unstake 100 STLO for addr9', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 100;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr9).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 10 STLO for addr2', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 10;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr2).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 10 STLO for addr6', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 14;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr7).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('Get Unstakers before', async () => { 
  	
  	    const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
  	    let unstakers = await Steelo2.getUnstakers();
  	    console.log("Unstakers before :", unstakers);

     })

   

   it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 56;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

   it('Steez Status', async() => {
  
	const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const steezStatus = await Steelo4.connect(addr2).steezStatus(creatorId);
	console.log("Steez Status:", steezStatus);
	
    })
    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 56;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 1;
		await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    
    it('addr6 P2P sell 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 30;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 3;
		await Steez2.connect(addr6).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr4).stakeSteelo({value: ethers.utils.parseEther("3")})).to.not.be.reverted;

    })
   
    it('addr4 check steez invested steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkPreOrderStatus(creatorId, addr4.address);
	console.log("steez invested of addr4:", parseInt(balance[3], 10));
    });

    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });

    it('addr4 P2P buy 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 30;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 3;
		await Steez2.connect(addr4).P2PBuy(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    });

    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });
    it('addr4 check steez invested steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkPreOrderStatus(creatorId, addr4.address);
	console.log("steez invested of addr4:", parseInt(balance[3], 10));
    });


    it('addr6 check steez invested steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId, addr6.address);
	console.log("steez invested of addr6:", parseInt(balance[3], 10));
    });

    
   it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })

    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })

   it('Anniversary Starter add minus 1 year of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).anniversaryStarter(creatorId)).to.not.be.reverted;

    })

    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 18));	
    })
    it('addr4 P2P sell 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 30;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 3;
		await Steez2.connect(addr4).initiateP2PSell(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    
    
    it('addr6 P2P buy 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZP2PFacet', diamondAddress) 
		let creatorId = "fvG74d0z271TuaE6WD2t";
		let num = 30;
      		let amount = ethers.utils.parseEther(num.toString());
		let size = 3;
		await Steez2.connect(addr6).P2PBuy(creatorId, amount, size);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    });

    it('see all Steez transaction', async() => {
  
	const Steez4 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const transaction = await Steez4.connect(addr2).returnSteezTransaction(creatorId);
	console.log("Steez Transaction:", parseFloat(transaction));
	
    })
   
    it('liquidity provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("liquidity provider steelo balance :", parseFloat(balance));

    })

     it('ecosystem provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("ecosystem provider steelo balance :", parseFloat(balance));

    })

    
    

    
    

    it('Steelo Current Price:', async () => { 
  
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress)
      let price = await Steelo4.connect(addr1).steeloPrice();
      price /= 10 ** 6;
      console.log("Steelo Price Before :", parseFloat(price));

    })


    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })

    it('Get Unstakers after', async () => { 
  	
  	    const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
  	    let unstakers = await Steelo2.getUnstakers();
  	    console.log("Unstakers after :", unstakers);

  	  })
 
    it('liquidity provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("liquidity provider steelo balance :", parseFloat(balance));

    })

     it('ecosystem provider balance after any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("ecosystem provider steelo balance :", parseFloat(balance));

    })
   
    it('see all Steez transaction', async() => {
  
	const Steez4 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const transaction = await Steez4.connect(addr2).returnSteezTransaction(creatorId);
	console.log("Steez Transaction:", parseFloat(transaction));
	
    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("P2P addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("P2P addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("P2P addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("P2P addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("P2P addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("P2P addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
    

   
   
    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance( addr1.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance( addr3.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance( addr4.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance( addr5.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("P2P addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance( owner.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })


    it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })
    

    it('fetch creator with id', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const creator = await Steez2.connect(addr2).getCreatorWithId(creatorId);
	console.log("Creator id:", creator[0].creatorId);
	console.log("Creator Address:", creator[0].profileAddress);
	console.log("Steez Price:", (parseFloat(creator[1]) / 10 ** 18));
	console.log("Total Investors:", parseFloat(creator[2]));
	
    })

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('create a Creator another Account', async () => { 
  
	    try {
		const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
		profileId = "Vdew6XMcdTJQH2nsBLYF";
   		await Steez2.connect(addr5).createCreator(profileId);
		console.log("Creator Account Created Successulyy");
	    }
	    catch (error) {
		console.error("Creator Account Did not create successully :", error.message);
	    }

    })

    it('should create Steez', async () => { 
  
	    try {
		const Steez = await ethers.getContractAt('STEEZ4Facet', diamondAddress);
   		await Steez.connect(addr5).createSteez();
		console.log("Steez Created Successulyy");
	    }
	    catch (error) {
		console.error("Steez Did not create successully :", error.message);
	    }

    })

    it('fetch creator with id', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "Vdew6XMcdTJQH2nsBLYF";
   	const creator = await Steez2.connect(addr2).getCreatorWithId(creatorId);
	console.log("Creator id:", creator[0].creatorId);
	console.log("Creator Address:", creator[0].profileAddress);
	console.log("Steez Price:", (parseFloat(creator[1]) / 10 ** 18));
	console.log("Total Investors:", parseFloat(creator[2]));
	
    })

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('delete a Creator another Account', async () => { 
  
	    try {
		const Steez4 = await ethers.getContractAt('STEEZ4Facet', diamondAddress);
		profileId = "Vdew6XMcdTJQH2nsBLYF";
   		await Steez4.connect(addr5).deleteCreator(profileId);
		console.log("Creator Account Created Successulyy");
	    }
	    catch (error) {
		console.error("Creator Account Did not create successully :", error.message);
	    }

    })

    

    it('fetch creator with id', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "Vdew6XMcdTJQH2nsBLYF";
   	const creator = await Steez2.connect(addr2).getCreatorWithId(creatorId);
	console.log("Creator id:", creator[0].creatorId);
	console.log("Creator Address:", creator[0].profileAddress);
	console.log("Steez Price:", (parseFloat(creator[1]) / 10 ** 18));
	console.log("Total Investors:", parseFloat(creator[2]));
	
    })

     it('create a Creator another 3rd Account', async () => { 
  
	    try {
		const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
		profileId = "abcd6XMcdTJQH2nsBLYF";
   		await Steez2.connect(addr8).createCreator(profileId);
		console.log("Creator Account Created Successulyy");
	    }
	    catch (error) {
		console.error("Creator Account Did not create successully :", error.message);
	    }

    })

    it('should create Steez', async () => { 
  
	    try {
		const Steez = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
   		await Steez.connect(addr8).createSteez();
		console.log("Steez Created Successulyy");
	    }
	    catch (error) {
		console.error("Steez Did not create successully :", error.message);
	    }

    })

    

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creator 1:", parseFloat(creator[0].steezPrice), parseFloat(creator[0].totalInvestors), creator[0].steezStatus, creator[0].investors, formatTimestampToDate(creator[0].preorderStartTime));
	console.log("Creator 2:", parseFloat(creator[1].steezPrice), parseFloat(creator[1].totalInvestors), creator[1].steezStatus, creator[1].investors, formatTimestampToDate(creator[1].preorderStartTime));
	
    })

    it('see all Steez transaction', async() => {
  
	const Steez4 = await ethers.getContractAt('STEEZCreatorFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const transaction = await Steez4.connect(addr2).returnSteezTransaction(creatorId);
	console.log("Steez Transaction:", parseFloat(transaction));
	
    })
 
    it('Steez Status', async() => {
  
	const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const steezStatus = await Steelo4.connect(addr2).steezStatus(creatorId);
	console.log("Steez Status:", steezStatus);
	
    })

    it('should create Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let exclusivity = true;
		let videoId = "xyghYUGfghjh";
		let name = "only god can judge me";
		let thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
		let videoUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorVideos%2F2024-05-25T11%3A42%3A03.397Z_2pac%20-%20Only%20God%20can%20Judge%20me.mkv?alt=media&token=3cdae92b-83e0-4f8b-bd07-b2a2c17ad451";
   		let description = "";
		await Steez8.connect(addr8).createContent( videoId, name, thumbnailUrl, videoUrl, exclusivity, description);
		console.log("Content Created Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not create successully :", error.message);
	    }

    })
     it('fetch one creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
	let videoId = "xyghYUGfghjh";
   	const creatorContent = await Steez8.connect(addr2).getOneCreatorContent( creatorId, videoId);
	console.log("Creator Content:", creatorContent);
	
    })

    it('fetch all creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
   	const creatorContent = await Steez8.connect(addr2).getAllCreatorContents( creatorId);
	console.log("Creator Content:", creatorContent);
	
    })


    it('fetch all Contents', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
   	const creatorContent = await Steez8.connect(addr2).getAllContents();
	console.log("Creator Content:", creatorContent);
	
    })


    

    it('fetch all creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
   	const creatorContent = await Steez8.connect(addr2).getAllCreatorContents( creatorId);
	console.log("Creator Content:", creatorContent);
	
    })


    it('fetch all Contents', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
   	const creatorContent = await Steez8.connect(addr2).getAllContents();
	console.log("Creator Content:", creatorContent);
	
    })


    it('fetch one creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
	let videoId = "xyghYUGfghjh";
   	const creatorContent = await Steez8.connect(addr2).getOneCreatorContent( creatorId, videoId);
	console.log("Creator Content:", creatorContent);
	
    })
   
    it("fetch all Investors of one creator", async() => {
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const investors = await Steez8.connect(addr2).getAllInvestors( creatorId );
	console.log("Investors:", investors);	
    })

     it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(creatorId, addr2.address);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be :", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be :", parseInt(balance[4], 10));
    });
    

    
    
    
 
    it('addr2 bid anniversary 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZAnniversaryFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr2).bidAnniversary(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr6 bid anniversary 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZAnniversaryFacet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).bidAnniversary(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })


    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).getTotalSteeloInvested(creatorId, addr1.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })

   


    it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(creatorId, addr2.address);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });

    it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr1.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creator 1:", parseFloat(creator[0].steezPrice), parseFloat(creator[0].totalInvestors), creator[0].steezStatus);
	console.log("Creator 2:", parseFloat(creator[1].steezPrice), parseFloat(creator[1].totalInvestors), creator[1].steezStatus);
	
    })

	it('should create Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let exclusivity = true;
		let videoId = "abcdYUGfghjh";
		let name = "only god can judge me";
		let thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
		let videoUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorVideos%2F2024-05-25T11%3A42%3A03.397Z_2pac%20-%20Only%20God%20can%20Judge%20me.mkv?alt=media&token=3cdae92b-83e0-4f8b-bd07-b2a2c17ad451";
   		let description = "";
   		await Steez8.connect(addr8).createContent( videoId, name, thumbnailUrl, videoUrl, exclusivity, description);
		console.log("Content Created Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not create successully :", error.message);
	    }

    })
	it('should create Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let exclusivity = true;
		let videoId = "bcdefhYUGfghjh";
		let name = "only god can judge me";
		let thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
		let videoUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorVideos%2F2024-05-25T11%3A42%3A03.397Z_2pac%20-%20Only%20God%20can%20Judge%20me.mkv?alt=media&token=3cdae92b-83e0-4f8b-bd07-b2a2c17ad451";
   		let description = "";
   		await Steez8.connect(addr8).createContent( videoId, name, thumbnailUrl, videoUrl, exclusivity, description);
		console.log("Content Created Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not create successully :", error.message);
	    }

    })

     	it('should create Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let exclusivity = true;
		let videoId = "cdefghYUGfghjh";
		let name = "only god can judge me";
		let thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
		let videoUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorVideos%2F2024-05-25T11%3A42%3A03.397Z_2pac%20-%20Only%20God%20can%20Judge%20me.mkv?alt=media&token=3cdae92b-83e0-4f8b-bd07-b2a2c17ad451";
   		let description = "";
   		await Steez8.connect(addr8).createContent( videoId, name, thumbnailUrl, videoUrl, exclusivity, description);
		console.log("Content Created Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not create successully :", error.message);
	    }

    })
     	it('should create Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let exclusivity = true;
		let videoId = "defhijYUGfghjh";
		let name = "only god can judge me";
		let thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
		let videoUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorVideos%2F2024-05-25T11%3A42%3A03.397Z_2pac%20-%20Only%20God%20can%20Judge%20me.mkv?alt=media&token=3cdae92b-83e0-4f8b-bd07-b2a2c17ad451";
   		let description = "";
   		await Steez8.connect(addr8).createContent( videoId, name, thumbnailUrl, videoUrl, exclusivity, description);
		console.log("Content Created Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not create successully :", error.message);
	    }

    })

        it('fetch all creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
   	const creatorContent = await Steez8.connect(addr2).getAllCreatorContents( creatorId);
	console.log("Creator Content:", creatorContent);
	
    })
	it('should delete Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let videoId = "abcdYUGfghjh";
   		await Steez8.connect(addr8).deleteContent( videoId);
		console.log("Content deleted Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not delete successully :", error.message);
	    }

    })

	it('should delete Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let videoId = "bcdefhYUGfghjh";
   		await Steez8.connect(addr8).deleteContent( videoId);
		console.log("Content deleted Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not delete successully :", error.message);
	    }

    })
	it('should delete Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let videoId = "cdefghYUGfghjh";
   		await Steez8.connect(addr8).deleteContent( videoId);
		console.log("Content deleted Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not delete successully :", error.message);
	    }

    })

	it('should delete Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let videoId = "defhijYUGfghjh";
   		await Steez8.connect(addr8).deleteContent( videoId);
		console.log("Content deleted Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not delete successully :", error.message);
	    }

    })
    
    it('fetch all creator Content', async() => {
  
	const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
	let creatorId = "abcd6XMcdTJQH2nsBLYF";
   	const creatorContent = await Steez8.connect(addr2).getAllCreatorContents( creatorId);
	console.log("Creator Content:", creatorContent);
	
    })    
     
    it("Percentage", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getPercentage(creatorId);
	console.log("percent :", (parseFloat(percent) / 10 ** 16));	
    })

    it("Daily Price", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const dailyPriceArray = await Steez.connect(addr1).getDailySteezPrice(creatorId);
	console.log("steez Price :", parseFloat(dailyPriceArray[0].steezPrice) / (10 ** 18), "day :", formatTimestampToDate(dailyPriceArray[0].day));	
	console.log("steez Price :", parseFloat(dailyPriceArray[1].steezPrice) / (10 ** 18), "day :", formatTimestampToDate(dailyPriceArray[1].day));	
	console.log("steez Price :", parseFloat(dailyPriceArray[2].steezPrice) / (10 ** 18), "day :", formatTimestampToDate(dailyPriceArray[2].day));	
    })

    it("Get ROI", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const profit = await Steez.connect(addr6).getROI(creatorId, addr6.address);
	console.log("profit :", (parseFloat(profit) / 10 ** 18));	
    })

    

     it("Daily Steelo Investment", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const dailySteeloArray = await Steez.connect(addr6).getDailySteeloInvestment(creatorId, addr6.address);
	console.log("daily steelo array", dailySteeloArray);
	console.log("steelo Price :", parseFloat(dailySteeloArray[0].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[0].day));	
	console.log("steelo Price :", parseFloat(dailySteeloArray[1].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[1].day));	
	console.log("steelo Price :", parseFloat(dailySteeloArray[2].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[2].day));	
    })

    it('Total Steelo Invested In Creator', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZDataBaseFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkBidAmount(creatorId, addr6.address);
	console.log("Total Steelo You Invested :", parseInt(balance[0], 10) / (10 ** 18));
	

    })

    it('Get Total Steelo Invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).getTotalSteeloInvested(creatorId, addr6.address);
	console.log("Total Steelo You Invested :", parseInt(balance, 10) / (10 ** 18));
	

    })

    it("Daily Total Steelo Investment", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const dailySteeloArray = await Steez.connect(addr6).getDailyTotalSteeloInvestment(creatorId, addr6.address);
	console.log("daily total steelo array", dailySteeloArray);
	console.log("steelo Price :", parseFloat(dailySteeloArray[0].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[0].day));	
	console.log("steelo Price :", parseFloat(dailySteeloArray[1].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[1].day));	
	console.log("steelo Price :", parseFloat(dailySteeloArray[2].steeloInvested) / (10 ** 18), "day :", formatTimestampToDate(dailySteeloArray[2].day));	
    })


    it(" Total Steeelo Percent", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr1).getTotalSteeoPercent(creatorId, addr1.address);
	console.log("Total Steelo Percent :", (parseFloat(percent)));	
    })
    


    it(" Total Steeelo Percent", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const percent = await Steez.connect(addr6).getTotalSteeoPercent(creatorId, addr6.address);
	console.log("Total Steelo Percent :", (parseFloat(percent)));	
    })



    it('should add collaborators', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('STEEZCollaboratorFacet', diamondAddress);
		let creatorId = "abcd6XMcdTJQH2nsBLYF";	
		let contentId = "xyghYUGfghjh";
		let collaboratorAddress = "0xbF0EC6466EbdF64ffeb2C660E73dD3A3e063412e";
		let collaboratorPercent = 10;
		let collaboratorName = "ezra";
		let profileUrl = "https://firebasestorage.googleapis.com/v0/b/steelo-testnet.appspot.com/o/creatorThumbnails%2F2024-05-25T11%3A42%3A10.536Z_only%20god%20can%20judge%20me.jpeg?alt=media&token=2b58d992-ecd6-407d-a464-035ab6fbd75e";
   		let collaboratorRole = "DJ";
		await Steez8.connect(addr8).addCollaborator( creatorId, contentId, collaboratorAddress, collaboratorPercent, collaboratorName, profileUrl, collaboratorRole )
		console.log("Collaborator added Successulyy");
	    }
	    catch (error) {
		console.error("Collaborator Did not create successully :", error.message);
	    }

    })


    it(" Get Content Collaborator", async () => {
      	const Steez = await ethers.getContractAt('STEEZPercentageFacet', diamondAddress)
	let contentId = "xyghYUGfghjh";
	const collaborator = await Steez.connect(addr6).getContentCollaborators(contentId);
	console.log("Content Collaborator :", (collaborator));	
    })

    it('should delete Content', async () => { 
  
	    try {
		const Steez8 = await ethers.getContractAt('CollectibleContentFacet', diamondAddress);
		let videoId = "xyghYUGfghjh";
   		await Steez8.connect(addr8).deleteContent( videoId);
		console.log("Content deleted Successulyy");
	    }
	    catch (error) {
		console.error("Content Did not delete successully :", error.message);
	    }

    })


        
    
    



   

    
 
	
});
