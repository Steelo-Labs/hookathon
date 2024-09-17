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


//   it('should initiate Steez', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//  	await expect(Steez.connect(owner).steezInitiate()).to.not.be.reverted;
//
//    })


//   it('should check name of Steez token name is Steez', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEEZFacet', diamondAddress)
//      let name = await Steelo.creatorTokenName()
//      expect(name).to.equal("Steez");
//
//    })

   

   
    it('should fail to check name of Steelo coin name is Ezra', async () => { 
  
      const Steelo = await ethers.getContractAt('STEEZFacet', diamondAddress)
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
    it('should fail to check name of Steelo coin symbol is ETH', async () => { 
  
      const Steelo = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let symbol = await Steelo.creatorTokenSymbol()
      expect(symbol).to.not.equal("ETH");

    })

    it('should create Steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	await expect(Steez.connect(owner).createSteez()).to.not.be.reverted;

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator(0);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check creators data created part 2', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator2(0);
      console.log("auction start time :", parseInt(creators[0], 10),"auction anniversery :", parseInt(creators[1], 10),"auction concluded :", creators[2]);

    })

    it('should check creators data created part 3 before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator3(0);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })
    it('should create Steez Again', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	await expect(Steez.connect(owner).createSteez()).to.be.reverted;

    })


//    it('should create Steez again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//   	await expect(Steez.connect(owner).createSteez()).to.not.be.reverted;
//
//    })

//    it('should check all creators created again', async () => { 
//  
//	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
//      const creators = await Steez.getAllCreatorIds();
//      expect(parseInt(creators, 10)).to.equal(2);
//      expect(parseInt(creators, 10)).to.not.equal(1);
//
//    })


    it('should preorder steez', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	await expect(Steez.connect(owner).initializePreOrder(0)).to.not.be.reverted;

    })


    it('should check creators data created part 3 after', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator3(0);
      console.log("preorder start time :", parseInt(creators[0], 10),"liquidity pool :", parseInt(creators[1], 10),"preorder started :", creators[2]);

    })

    it('should fail to preorder steez again', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	await expect(Steez.connect(owner).initializePreOrder(0)).to.be.reverted;

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



      it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr1).steeloMint(amount )).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000100);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      console.log("Balance of address 1 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(100);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })


    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr2).steeloMint(amount )).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      console.log("Total Supply :", parseInt(totalSupply, 10));
      totalSupply /= (10 ** 18);
      expect(totalSupply).to.equal(825000200);

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));
      balance /= (10 ** 18);
      expect(parseInt(balance, 10)).to.equal(100);
      expect(parseInt(balance, 10)).to.not.equal(0);

    })

    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr3).steeloMint(amount )).to.not.be.reverted;

    })

    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr4).steeloMint(amount )).to.not.be.reverted;

    })

    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr5).steeloMint(amount )).to.not.be.reverted;

    })

    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
      await expect(Steez.connect(addr1).bidPreOrder(0, amount )).to.not.be.reverted;

    })
    
    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
      await expect(Steez.connect(addr2).bidPreOrder(0, amount )).to.not.be.reverted;

    })


    it('should bid preorder 1', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
      await expect(Steez.connect(addr3).bidPreOrder(0, amount )).to.not.be.reverted;

    })
    
    it('should bid preorder 2', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 110;
      await expect(Steez.connect(addr1).bidPreOrder(0, amount )).to.be.reverted;

    })

    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 20;
      await expect(Steez.connect(addr1).bidPreOrder(0, amount )).to.be.reverted;

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
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr1).checkBidAmount(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));


    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 20;
      await expect(Steez.connect(addr5).bidPreOrder(0, amount )).to.be.reverted;

    })
	

    })
    it('should bid preorder 1', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 40;
      await expect(Steez.connect(addr4).bidPreOrder(0, amount )).to.not.be.reverted;

    })
 
    it('should bid preorder 3', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 40;
      await expect(Steez.connect(addr5).bidPreOrder(0, amount )).to.not.be.reverted;

    })

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	const balance = await Steez.connect(addr1).FirstAndLast(0);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr2.address);
      console.log("Balance of address 2 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr2).checkBidAmount(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check investors balance', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      const balance = await Steez.checkInvestors(0);
      console.log("investor length :", parseInt(balance[0], 10),"steelo Invested :", parseInt(balance[1], 10),"time invested :", parseInt(balance[2]), "address of investor :", balance[3].toString());

    })


    it('should check equality', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const equality = await Steez.equality();
      console.log("eqaulity :", equality);

    })

    



    

    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(addr6).steeloMint(amount )).to.not.be.reverted;

    })
     

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
      await expect(Steez.connect(addr6).bidPreOrder(0, amount )).to.be.reverted;

    })

    it('should bid preorder 6', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 39;
      await expect(Steez.connect(addr6).bidPreOrder(0, amount )).to.be.reverted;

    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const length = await Steez.connect(owner).checkInvestorsLength(0);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr4).checkBidAmount(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    


    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      const balance = await Steelo.steeloBalanceOf(addr4.address);
      console.log("Balance of address 4 :", parseInt(balance, 10));

    })

    

    it('should check addr1 steez bid amount', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr4).checkBidAmount(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2]), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check to be popped index', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const index = await Steez.getPopIndex();
      console.log("popping index :", parseInt(index[0]), "poppin address :", index[1].toString(), "popping price :", parseInt(index[2], 10));

    })

    it('should check to be popped index', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const index = await Steez.getPopData(0);
      console.log("pop amount :", parseInt(index[0], 10), "pop address :", index[1].toString());

    })

    it('should check investors length before', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const length = await Steez.connect(owner).checkInvestorsLength(0);
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
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkBidAmount(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"liquidity pool :", parseInt(balance[1], 10),"auction secured :", parseInt(balance[2], 10), "Total Steelo Preorder :", parseInt(balance[3], 10));
	

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator(0);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should bid preorder 1', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      let amount = 30;
      await expect(Steez.connect(addr6).PreOrderEnder(0, amount )).to.not.be.reverted;

    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator(0);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10));

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('addr1 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr1).AcceptOrReject(0, true )).to.not.be.reverted;

    })

    it('addr1 accepting preorder bid again', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr1).AcceptOrReject(0, true )).to.be.reverted;

    })

    it('addr2 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr2).AcceptOrReject(0, true )).to.not.be.reverted;

    })

    it('addr3 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr3).AcceptOrReject(0, true )).to.not.be.reverted;

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    

    it('addr4 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr4).AcceptOrReject(0, true )).to.not.be.reverted;

    })

    it('addr5 accepting preorder bid', async () => { 
  
      const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
      await expect(Steez.connect(addr5).AcceptOrReject(0, true )).to.not.be.reverted;

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(0);
	console.log("bid Amount :", parseInt(balance[0], 10),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
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
      await expect(Steez.connect(addr6).AcceptOrReject(0, true )).to.be.reverted;

    })

    it('should check preorder status', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
	console.log("bid Amount :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance :", parseInt(balance[1], 10),"total steelo  :", parseInt(balance[2], 10), "steez invested :", parseInt(balance[3], 10), "lqiuidity pool :", parseInt(balance[4], 10));
	

    })
 

    it("should check first and last", async () => {
      	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress)
	const balance = await Steez.connect(addr1).FirstAndLast(0);
	console.log("first :", parseInt(balance[0], 10),"last :", parseInt(balance[1], 10));	
    })

    it('should check creators data created part 1', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator(0);
      console.log("creator address :", creators[0].toString(), "total supply :",parseInt(creators[1], 10), "current price :", parseInt(creators[2], 10) / (10 ** 18));

    })
    

    it('should mint 1000 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 2000;
      await expect(Steelo.connect(addr1).steeloMint(amount )).to.not.be.reverted;

    })

    it('should mint 1000 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOFacet', diamondAddress)
      let amount = 2000;
      await expect(Steelo.connect(addr6).steeloMint(amount )).to.not.be.reverted;

    })


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


    it('addr6 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
	console.log("bid Amount should be 0:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 5:", parseInt(balance[4], 10));
	

    })

    it('Launch Starter add minus 1 week of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress)
      await expect(Steez2.connect(addr6).launchStarter(0)).to.not.be.reverted;

    })


    it('addr6 bid launch 1 steez', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress)
      await expect(Steez2.connect(addr6).bidLaunch(0, 1 )).to.not.be.reverted;

    })
    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(0);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 0:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 4:", parseInt(balance[4], 10));
    });

    
    
    it('addr1 bid launch 4 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr1).bidLaunch(0, 4 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr1 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr1).checkPreOrderStatus(0);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 4:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('addr6 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
	console.log("bid Amount should be 34:", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });


    it('current price after two bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
      const creators = await Steez.getAllCreator(0);
      console.log("total supply:",parseInt(creators[1], 10), "current price after 2 bid launch:", parseInt(creators[2], 10) / (10 ** 18));


  });

  it('addr1 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr1).initiateP2PSell(0, 54, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr2 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr2).initiateP2PSell(0, 56, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr3 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr3).initiateP2PSell(0, 57, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr4 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr4).initiateP2PSell(0, 58, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('addr5 P2P sell 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr5).initiateP2PSell(0, 59, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    it('return all sellers', async () => { 
  
	const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress);
        const sellers = await Steez2.returnSellers(0);
        console.log("sellers of index : ", sellers.length);


  });


	it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(0);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
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
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const length = await Steez.connect(owner).checkInvestorsLength(0);
	console.log("Investor Length :", parseInt(length, 10));
	

    })



  it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr6).P2PBuy(0, 59, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('should check investors length after p2p buy', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const length = await Steez.connect(owner).checkInvestorsLength(0);
	console.log("Investor Length :", parseInt(length, 10));
	

    })

    it('addr5 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr5).checkPreOrderStatus(0);
	console.log("steez invested of addr5:", parseInt(balance[3], 10));
    });

	it('addr6 steez invested', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr6).checkPreOrderStatus(0);
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
  
	const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress);
        const sellers = await Steez2.returnSellers(0);
        console.log("sellers of index : ", sellers.length);


  });

   it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr6).P2PBuy(0, 56, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })


   it('Anniversary Starter add minus 1 year of the time stamp', async () => { 
  
      const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress)
      await expect(Steez2.connect(addr6).anniversaryStarter(0)).to.not.be.reverted;

    })

	it('addr6 P2P buy 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr6).P2PBuy(0, 57, 1);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })

    it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(0);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be :", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be :", parseInt(balance[4], 10));
    });
    

    it('addr2 bid anniversary 1 steez', async () => { 
  
      	try {	
      		const Steez2 = await ethers.getContractAt('STEEZ2Facet', diamondAddress) 
		await Steez2.connect(addr2).bidAnniversary(0, 1 );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}
      	

    })
    
    it('addr2 bid amount , steelo balance , total steelo and steez invested and total liquisity pool before bid launch', async () => { 
  
	const Steez = await ethers.getContractAt('STEEZFacet', diamondAddress);
   	const balance = await Steez.connect(addr2).checkPreOrderStatus(0);
	console.log("bid Amount should be :", parseInt(balance[0], 10) / (10 ** 18),"steelo balance should be :", parseInt(balance[1], 10) / (10 ** 18),"total steelo  :", parseInt(balance[2], 10) / (10 ** 18), "steez invested should be 1:", parseInt(balance[3], 10), "lqiuidity pool before bid launch should be 0:", parseInt(balance[4], 10));
    });

    
 
	
});
