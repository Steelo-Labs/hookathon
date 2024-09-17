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
      let role = await AccessControl.connect(addr1).getRole();
      console.log("role of addr1 address :", role);

    })
     
    it('check out the power of the addr1', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr1).getPower();
      console.log("admin power of addr1 :", role);

    })

    it('executive owner grant role admin to addr2', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr2.address)).to.not.be.reverted;

    })

    it('check out the role of addr2 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr2).getRole();
      console.log("role of addr2 address :", role);

    })
     
    it('check out the power of the addr2', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr2).getPower();
      console.log("admin power of addr2 :", role);

    })
    it('executive owner grant role admin to addr3', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr3.address)).to.not.be.reverted;

    })

    it('check out the role of addr3 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr3).getRole();
      console.log("role of addr3 address :", role);

    })
     
    it('check out the power of the addr3', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr3).getPower();
      console.log("admin power of addr3 :", role);

    })
    it('executive owner grant role admin to addr4', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr4.address)).to.not.be.reverted;

    })

    it('check out the role of addr4 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr4).getRole();
      console.log("role of addr4 address :", role);

    })
     
    it('check out the power of the addr4', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr4).getPower();
      console.log("admin power of addr4 :", role);

    }) 
    it('executive owner grant role admin to addr5', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr5.address)).to.not.be.reverted;

    })

    it('check out the role of addr5 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr5).getRole();
      console.log("role of addr5 address :", role);

    })
     
    it('check out the power of the addr5', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr5).getPower();
      console.log("admin power of addr5 :", role);

    })

    it('check out the role of addr6', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr6).getRole();
      console.log("role of addr6 address :", role);

    })


  it('should add the Steez Facet', async () => {

      const SteezFacet = await ethers.getContractFactory('STEEZFacet')
      const steezFacet = await SteezFacet.deploy()
  
      let selectors = getSelectors(steezFacet);
      let addresses = [];
      addresses.push(steezFacet.address);
      
      await diamondCutFacet.diamondCut([[steezFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

   it('Add the Steez2 Facet', async () => {

      const Steez2Facet = await ethers.getContractFactory('STEEZ2Facet')
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

      const Steez3Facet = await ethers.getContractFactory('STEEZ3Facet')
      const steez3Facet = await Steez3Facet.deploy()
  
      let selectors = getSelectors(steez3Facet);
      let addresses = [];
      addresses.push(steez3Facet.address);
      
      await diamondCutFacet.diamondCut([[steez3Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)


//   it('should initiate Steez', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
//  	await expect(Steez.connect(owner).steezInitiate()).to.not.be.reverted;
//
//    })


//   it('should check name of Steez token name is Steez', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
//      let name = await Steelo.creatorTokenName()
//      expect(name).to.equal("Steez");
//
//    })

   

   
    it('should fail to check name of Steelo coin name is Ezra', async () => { 
  
      const Steelo = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
      let name = await Steelo.creatorTokenName()
      expect(name).to.not.equal("Ezra");

    })

//    it('should check name of Steelo coin symbol is STZ', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZFacet', diamondAddress)
//      let symbol = await Steelo.creatorTokenSymbol()
//      expect(symbol).to.equal("STZ");
//
//    })
//    it('should fail to check name of Steelo coin symbol is ETH', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZFacet', diamondAddress)
//      let symbol = await Steelo.creatorTokenSymbol()
//      expect(symbol).to.not.equal("ETH");
//
//    })

    it('create a Creator Account', async () => { 
  
	    try {
		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
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
		const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   		await Steez.connect(owner).createSteez();
		console.log("Steez Created Successulyy");
	    }
	    catch (error) {
		console.error("Steez Did not create successully :", error.message);
	    }

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      	const creators = await Steez.getAllCreator(creatorId);
      	console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check creators data created part 2', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator2(creatorId);
      console.log("auction start time :", parseInt(creators[0], 10),"auction anniversery :", parseInt(creators[1], 10),"auction concluded :", creators[2]);

    })

    it('should check creators data created part 3 before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator3(creatorId);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })
    it('should create Steez Again', async () => { 
  
	try {
		const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   		await Steez.connect(owner).createSteez();
		console.log("Transaction Succeded");
	}
	    catch (error) {
		console.log("Transaction failed :", error.message);
	    }

    })


//    it('should create Steez again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//   	await expect(Steez.connect(owner).createSteez()).to.not.be.reverted;
//
//    })

//    it('should check all creators created again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
//      const creators = await Steez.getAllCreatorIds();
//      expect(parseInt(creators, 10)).to.equal(2);
//      expect(parseInt(creators, 10)).to.not.equal(1);
//
//    })


    it('should preorder steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	await expect(Steez.connect(owner).initializePreOrder(creatorId)).to.not.be.reverted;

    })


    it('should check creators data created part 3 after', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator3(creatorId);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })

    it('should fail to preorder steez again', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	await expect(Steez.connect(owner).initializePreOrder(creatorId)).to.be.reverted;

    })

//    it('should check auction slots secured of a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const auctions = await Steez.getAuctionSlotsSecured(1, 1);
//      expect(parseInt(auctions, 10)).to.equal(2);
//      expect(parseInt(auctions, 10)).to.not.equal(0);
//
//    })

//    it('should check creator of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const creator = await Steez.getSteezCreatorAddress(1, 1);
//      expect(creator.toString()).to.equal("0x969De22db9fBBaa64C085E76ce2E954eF531BF25");
//      expect(creator.toString()).to.not.equal("0x0");
//
//    })

//    it('should check total supply of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const creator = await Steez.getTotalSteezs(1, 1);
//      expect(parseInt(creator, 10)).to.equal(500);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })

//    it('should check current price of a steez in a preorder', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const creator = await Steez.getSteezsPrice(1, 1);
//      expect(parseInt(creator, 10)).to.equal(2);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })

//    it('should check amount possessed of a cretor in steez', async () => { 
//  
//      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const creator = await Steez.getSteezAmount(1, 1);
//      console.log((parseInt(creator, 10)));
//      expect(parseInt(creator, 10)).to.equal(2);
//      expect(parseInt(creator, 10)).to.not.equal(0);
//
//    })


//    it('should check anniversaru', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//   	await expect(Steez.connect(owner).anniversary(1, 1, 10)).to.not.be.reverted;
//
//    })





      it('should add the Steelo Facet', async () => {

      const SteeloFacet = await ethers.getContractFactory('STEELOFacet')
      const steeloFacet = await SteeloFacet.deploy()
  
      let selectors = getSelectors(steeloFacet);
      let addresses = [];
      addresses.push(steeloFacet.address);
      
      await diamondCutFacet.diamondCut([[steeloFacet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)

   it('should initiate Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloInitiate()).to.not.be.reverted;

    })

    it('should go with Steelo Token Generation', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloTGE()).to.not.be.reverted;

    })

	it('should add the Steelo 2 Facet', async () => {

      const Steelo2Facet = await ethers.getContractFactory('STEELO2Facet')
      const steelo2Facet = await Steelo2Facet.deploy()
  
      let selectors = getSelectors(steelo2Facet);
      let addresses = [];
      addresses.push(steelo2Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo2Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
      assert.sameMembers(result, selectors)
  
    }).timeout(600000)
    



      it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr1).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000000);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      console.log("Balance of address 1 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(100);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })


    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr2).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000000);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(100);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 2;
      await expect(Steelo.connect(addr3).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 3;
      await expect(Steelo.connect(addr4).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr5).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Buy addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Buy addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Buy addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Buy addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Buy addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Buy addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Buy Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    

    it('addr1 bid 30 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
    
    it('addr2 bid 30 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr2).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })


    it('addr3 bid 30 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr3).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
    
    it('should bid preorder 2', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 110;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 20;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      console.log("Balance of address 1 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(70);
      expect(parseInt(balance, 10)).to.not.equal(100);

    })

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkBidAmount(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));


    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 20;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).bidPreOrder(creatorId, amount )).to.be.reverted;

    })
	

    })
    it('addr4 4 bid 40 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 40;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr4).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })
 
    it('addr5 bid 40 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 40;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Preorder Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Preorder addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Preorder addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Preorder addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Preorder addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Preorder addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })
    
    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Preorder addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })


    it('addr1 again bid 30 steelo', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 32;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).bidPreOrder(creatorId, amount )).to.not.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("addr1 balance after bid again:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of addr1 after bid again :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const balance = await Steez.connect(addr1).FirstAndLast(creatorId);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkBidAmount(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check investors balance', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const balance = await Steez.checkInvestors(creatorId);
      console.log("investor length :", parseInt(balance[0], 10),"steelo Invested :", parseInt(balance[1], 10),"time invested :", parseInt(balance[2]), "address of investor :", balance[3].toString());

    })


//    it('should check equality', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const equality = await Steez.equality();
//      console.log("eqaulity :", equality);
//
//    })

    



    

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr6).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })
     

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 39;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).bidPreOrder(creatorId, amount )).to.be.reverted;

    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkBidAmount(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr4).checkBidAmount(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

//    it('should check to be popped index', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const index = await Steez.getPopIndex();
//      console.log("popping index :", parseInt(index[0]), "poppin address :", index[1].toString(), "popping price :", parseInt(index[2], 10));
//
//    })

//    it('should check to be popped index', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//	let creatorId = "fvG74d0z271TuaE6WD2t";
//     const index = await Steez.getPopData(creatorId);
//      console.log("pop amount :", parseInt(index[0], 10), "pop address :", index[1].toString());
//
//    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

 //   it('should bid preorder 6', async () => { 
 // 
 //     const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
 //     let amount = 62;
 //     await expect(Steez.connect(addr6).bidPreOrder(0, amount )).to.not.be.reverted;
//
//    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkBidAmount(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2], 10), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should bid preorder 1', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
      let amount = 30;
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).PreOrderEnder(creatorId, amount )).to.not.be.reverted;

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

     it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("PreOrder Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("PreOrder addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it('addr1 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('addr1 accepting preorder bid again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr1).AcceptOrReject(creatorId, true )).to.be.reverted;

    })

    it('addr2 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr2).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('addr3 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr3).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    

    it('addr4 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr4).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('addr5 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr5).AcceptOrReject(creatorId, true )).to.not.be.reverted;

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

//    it('should accept or reject after preorder 6 first', async () => { 
//  
//      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
//      await expect(Steez.connect(addr6).AcceptOrReject(0, true )).to.not.be.reverted;
//
//    })

    it('should accept or reject after preorder 6 again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez.connect(addr6).AcceptOrReject(creatorId, true )).to.be.reverted;

    })


     it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Approval addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Approval addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Approval addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Approval addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Approval addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Approval addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("bid Amount :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })
 

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
	const balance = await Steez.connect(addr1).FirstAndLast(creatorId);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10) / (10 ** 18));

    })
    

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr1).stakeSteelo(month, {value: ethers.utils.parseEther("3")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr6).stakeSteelo(month, {value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })


//    it('Add the Steez2 Facet', async () => {
//
//      const Steez2Facet = await ethers.getContractFactory('STEEZ2Facet')
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
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be 0:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 5:", parseInt(balance[4], 10));
	

    })

    it('Launch Starter add minus 1 week of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).launchStarter(creatorId)).to.not.be.reverted;

    })


it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr5 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Approval Staked Balance of addr6 :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Approval addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Approval addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Approval addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Approval addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Approval addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Approval addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
    


    it('addr6 bid launch 1 steez', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).bidLaunch(creatorId, 1 )).to.not.be.reverted;

    })
    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 4:", parseInt(balance[4], 10));
    });

    
    
    it('addr1 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr1).bidLaunch(creatorId, 4 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr1 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).bidLaunch(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Launch addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Launch addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Launch addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Launch addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Launch addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Launch addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
    

    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 4:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('addr6 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be 34:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('current price after two bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
      const creators = await Steez.getAllCreator(creatorId);
      console.log("total supply:",parseInt(creators[1], 10), "current price after 2 bid launch:", parseInt(creators[2], 10) / (10 ** 18));


  });


it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Launch Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("Launch addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Launch addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Launch addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Launch addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Launch addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Launch addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
  

  it('addr1 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr1).initiateP2PSell(creatorId, 54, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr2 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr2).initiateP2PSell(creatorId, 56, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr3 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr3).initiateP2PSell(creatorId, 57, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr4 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr4).initiateP2PSell(creatorId, 58, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr5 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr5).initiateP2PSell(creatorId, 59, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });


	it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("steez invested of addr6:", parseInt(balance[3], 10));
    });

	it('steelo balance of addr6', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('steelo balance of addr5', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr5.address);
      console.log("Balance of address 5 :", parseInt(balance, 10) / (10 ** 18));

    })

     it('should check investors length before p2pbuy', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })



  it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).P2PBuy(creatorId, 59, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('should check investors length after p2p buy', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const length = await Steez.connect(owner).checkInvestorsLength(creatorId);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(creatorId);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(creatorId);
	console.log("steez invested of addr6:", parseInt(balance[3], 10));
    });
   

	it('steelo balance of addr6', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr6.address);
      console.log("Balance of address 6 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('steelo balance of addr5', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr5.address);
      console.log("Balance of address 5 :", parseInt(balance, 10) / (10 ** 18));

    })
	it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
        const sellers = await Steez2.returnSellers(creatorId);
        console.log("sellers of index : ", sellers.length);


  });

   it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).P2PBuy(creatorId, 56, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })


   it('Anniversary Starter add minus 1 year of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress)
	let creatorId = "fvG74d0z271TuaE6WD2t";
      await expect(Steez2.connect(addr6).anniversaryStarter(creatorId)).to.not.be.reverted;

    })

	it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr6).P2PBuy(creatorId, 57, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("P2P Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("P2P addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("P2P addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("P2P addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("P2P addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("P2P addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("P2P addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
    

    it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be :", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be :", parseInt(balance[4], 10));
    });
    

    it('addr2 bid anniversary 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
	let creatorId = "fvG74d0z271TuaE6WD2t";
		await Steez2.connect(addr2).bidAnniversary(creatorId, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    
    it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(creatorId);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });
   
    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr1).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr2 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr3).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr3 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr4).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr4 :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr5).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr5 :", parseFloat(balance));

    })

	it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Anniversary Staked Balance of addr6 :", parseFloat(balance));

    })
    

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("P2P addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr2 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr3 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr4 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr5 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("Anniversary addr6 balance before buying STLO with 1 ether :", parseFloat(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("Creator Steelo balance :", parseFloat(balance));

    })

it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELO2Facet', diamondAddress)
      let balance = await Steelo2.connect(owner).getStakedBalance();
      balance /= 10 ** 18;
      console.log("Staked Balance of creator :", parseFloat(balance));

    })
    

    it('fetch creator with id', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "fvG74d0z271TuaE6WD2t";
   	const creator = await Steez2.connect(addr2).getCreatorWithId(creatorId);
	console.log("Creator id:", creator[0].creatorId);
	console.log("Creator Address:", creator[0].profileAddress);
	console.log("Steez Price:", (parseFloat(creator[1]) / 10 ** 18));
	console.log("Total Investors:", parseFloat(creator[2]));
	
    })

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })

    it('create a Creator another Account', async () => { 
  
	    try {
		const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
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
		const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   		await Steez.connect(addr5).createSteez();
		console.log("Steez Created Successulyy");
	    }
	    catch (error) {
		console.error("Steez Did not create successully :", error.message);
	    }

    })

    it('fetch creator with id', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
	let creatorId = "Vdew6XMcdTJQH2nsBLYF";
   	const creator = await Steez2.connect(addr2).getCreatorWithId(creatorId);
	console.log("Creator id:", creator[0].creatorId);
	console.log("Creator Address:", creator[0].profileAddress);
	console.log("Steez Price:", (parseFloat(creator[1]) / 10 ** 18));
	console.log("Total Investors:", parseFloat(creator[2]));
	
    })

    it('fetch all creators', async() => {
  
	const Steez2 = await ethers.getContractAt('STEEZ3Facet', diamondAddress);
   	const creator = await Steez2.connect(addr2).getAllCreatorsData();
	console.log("Creators:", creator);
	
    })



   

    
 
	
});
