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
      let role = await AccessControl.connect(addr2).getRole( addr2.address);
      console.log("role of addr2 address :", role);

    })
     
    
    it('executive owner grant role admin to addr3', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr3.address)).to.not.be.reverted;

    })

    it('check out the role of addr3 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr3).getRole( addr3.address);
      console.log("role of addr3 address :", role);

    })
     
    
    it('executive owner grant role admin to addr4', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr4.address)).to.not.be.reverted;

    })

    it('check out the role of addr4 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr4).getRole( addr4.address);
      console.log("role of addr4 address :", role);

    })
     
     
    it('executive owner grant role admin to addr5', async () => { 
  
	const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
	role = "ADMIN_ROLE";
  	await expect(AccessControl.connect(owner).grantRole(role, addr5.address)).to.not.be.reverted;

    })

    it('check out the role of addr5 ', async () => { 
  
      const AccessControl = await ethers.getContractAt('AccessControlFacet', diamondAddress);
      let role = await AccessControl.connect(addr5).getRole( addr5.address);
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

      it('should add the Steelo6 Facet', async () => {

      const Steelo6Facet = await ethers.getContractFactory('STEELOERC20Facet')
      const steelo6Facet = await Steelo6Facet.deploy()
  
      let selectors = getSelectors(steelo6Facet);
      let addresses = [];
      addresses.push(steelo6Facet.address);
      
      await diamondCutFacet.diamondCut([[steelo6Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
  
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

     it('should check name of Steelo ERC20 coin name is Steelo', async () => { 
  
      const SteeloERC20 = await ethers.getContractAt('STEELOERC20Facet', diamondAddress)
      let name = await SteeloERC20.name()
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

    it('should check total supply of steelo to be 825000000', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      totalSupply /= 10 ** 18;
      console.log("total supply of steelo after executive initiated :", parseInt(totalSupply));

    })
    it('should go with Steelo Token Generation', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      await expect(Steelo.connect(owner).steeloTGE()).to.not.be.reverted;

    })

    it('should fail to check total supply of Steelo to be 200', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      totalSupply /= 10 ** 18;
      expect(totalSupply).to.not.equal(1000000000);

    })

    it('should check total supply to equal 825000000', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let number = 825000000;
      let constant = await Steelo.steeloTotalTokens();
      constant /= 10 ** 18;
      console.log("total token generated cosntant number :", parseInt(constant));
    })
	
    it('should fail to that total tokens generated should not be 1000000000', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let number = 1000000000;
      let constant = await Steelo.steeloTotalTokens()
      expect(parseInt(constant, 10)).to.not.equal(number);

    })

    it('should check steelo decimal to equal 18', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let number = 18;
      let constant = await Steelo.steeloDecimal()
      console.log("decimal amount for steelo token :", parseInt(constant));

    })
	
    it('should fail to that steelo decimal 16', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let number = 16;
      let constant = await Steelo.steeloDecimal()
      expect(parseInt(constant, 10)).to.not.equal(number);

    })

    it('should mint 100 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let amount = 100;
      await expect(Steelo.connect(owner).steeloMint(amount )).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000100', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      totalSupply = totalSupply / 10 ** 18;
      console.log("total supply value after 100 steelo tokens were minted", parseInt(totalSupply))

    })

    


    it('should check account balance of owner before STLO transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("balance of owner address after mint", parseInt(balance));

    })

    it('should transfer 10 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 10;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(owner).steeloTransfer(addr1.address, amount )).to.not.be.reverted;

    })

    it('should check account balance of owner after STLO transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("STLO balance of owner :", parseInt(balance));

    })
     it('should check account balance of addr1 after STLO transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("STLO balance of addr1 :", parseInt(balance));

    })
    
    it('should check total supply of steelo after a transfer between two addresses', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      totalSupply = totalSupply / 10 ** 18;
      console.log("total supply value after 10 steelo transfer", parseInt(totalSupply))

    })

    it('should transfer 740000 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 740000;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(owner).steeloTransfer(addr1.address, amount )).to.not.be.reverted;

    })

    it('should check account balance of owner after STLO transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("STLO balance of owner :", parseInt(balance));

    })
     it('should check account balance of addr1 after STLO transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("STLO balance of addr1 :", parseInt(balance));

    })
    
    it('should check total supply of steelo after a transfer between two addresses', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply()
      totalSupply = totalSupply / 10 ** 18;
      console.log("total supply value after 740000 steelo transfer", parseInt(totalSupply))

    })

    it('should check allowance between 2 accounts before no allowance', async () => { 
  
      	const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      	const allowance = await Steelo.steeloAllowance(owner.address, addr1.address);
	console.log("allowance between owner address and addr1 :", parseInt(allowance));

    })

//    it('should check if the owner approved some amount to addr1', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
//      let amount = 10;
//      await expect(Steelo.connect(owner).steeloApprove(addr1.address, amount)).to.not.be.reverted;
//
//    })
    
    it('should check allowance between 2 accounts after allowance', async () => { 
  
      	const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      	let allowance = await Steelo.steeloAllowance(owner.address, addr1.address);
	allowance /= 10 ** 18;
	console.log("allowance between owner address and addr1 after owner approved 10 STLO", parseInt(allowance));

    })

    it('should check if transfer of some amount from one address to another address', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 200;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(owner).steeloTransferFrom(owner.address, addr1.address, amount)).to.be.reverted;

    })

    it('should check if transfer of some amount from one address to another address', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 10;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(owner).steeloTransferFrom(owner.address, addr1.address, amount)).to.be.reverted;

    })
    it('should check if transfer of some amount from one address to another address', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 10;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(owner).steeloTransferFrom(owner.address, addr1.address, amount)).to.be.reverted;

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("STLO balance of owner after he let smart contract transfer 10 STLO to addr1 :", parseFloat(balance));

    })
    
    it('should check allowance between 2 accounts after transfer', async () => { 
  
      	const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      	const allowance = await Steelo.steeloAllowance(owner.address, addr1.address);
	console.log("allowance between owner and addr1 after smart transfer :", parseFloat(allowance));

    })

    it('should burn 50 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let amount = 50;
      await expect(Steelo.connect(owner).steeloBurn(amount )).to.not.be.reverted;

    })

    it('should check total supply of steelo to be 825000050', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply();
      totalSupply /= 10 ** 18;
      console.log("total supply after owner burned 50 tokens :", parseFloat(totalSupply));

    })
    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("addr1 balance before buying STLO with 1 ether :", parseFloat(balance));

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

    it('get ether balance of the contract before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address);
      balance /= 10 ** 18;
      console.log("Staked Balance :", parseFloat(balance));

    })


    it('Get interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr2).getInterest( addr2.address);
      console.log("Interest before staking:",parseFloat(interest));

    })
    

    it('Stake 1 Ether Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 1;
      await expect(Steelo.connect(addr2).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('Get interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr2).getInterest( addr2.address);
      console.log("Interest after staking:", parseFloat(interest));

    })

     it('Stake 1 Ether Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 6;
      await expect(Steelo.connect(addr2).stakeSteelo({value: ethers.utils.parseEther("0.5")})).to.not.be.reverted;

    })

    it('Get interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr2).getInterest( addr2.address);
      console.log("Interest after staking twice :", parseFloat(interest));

    })

    
    it('Stake 1 Ether Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 6;
      await expect(Steelo.connect(addr7).stakeSteelo({value: ethers.utils.parseEther("0.5")})).to.not.be.reverted;

    })

    it('Stake 1 Ether Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 1;
      await expect(Steelo.connect(addr6).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('Addr2 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr6).getInterest( addr6.address );
      console.log("Interest after staking twice :", parseFloat(interest));

    })
     

     it('should transfer 10 STLO from addr1 to addr2', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 50;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr7).steeloTransfer(addr6.address, amount )).to.not.be.reverted;

    })

     it('Addr2 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr6).getInterest( addr6.address );
      console.log("Interest after staking twice :", parseFloat(interest));

    })
     


     it('should check total supply of steelo to be ', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply();
      totalSupply /= 10 ** 18;
      console.log("total supply before stakers transfer :", parseFloat(totalSupply));

    })
    it('Balance of owner before stakers transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("owner balance before stakers transaction :", parseFloat(balance));

    })
    it('liquidity provider balance before any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr1.address);
      balance /= 10 ** 18;
      console.log("liquidity provider steelo balance :", parseFloat(balance));

    })

     it('ecosystem provider balance before any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("ecosystem provider steelo balance :", parseFloat(balance));

    })

     it('should transfer 10 STLO from addr1 to addr2', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 50;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr2).steeloTransfer(addr6.address, amount )).to.not.be.reverted;

    })
    it('should check total supply of steelo to be ', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let totalSupply = await Steelo.steeloTotalSupply();
      totalSupply /= 10 ** 18;
      console.log("total supply after stakers transfer :", parseFloat(totalSupply));

    })
     it('Balance of owner after stakers transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("owner balance after stakers transaction :", parseFloat(balance));

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
     it('addr7 balance before any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr7.address);
      balance /= 10 ** 18;
      console.log("addr7 steelo balance :", parseFloat(balance));

    })

    it('addr6 balance before any transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr6.address);
      balance /= 10 ** 18;
      console.log("addr6 steelo balance :", parseFloat(balance));

    })
    
     it('get ether balance of the contract after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

    })
    
    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr1 :", parseFloat(balance));

    })

    it('get staked ETH balance after of addr2 after transffering from addr1:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2 :", parseFloat(balance));

    })
    
    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
      balance /= 10 ** 18;
      console.log("addr1 balance after buying STLO with 1 ether :", parseFloat(balance));

    })

    it('stake period ender for addr1', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 1;
      await expect(Steelo2.connect(addr2).stakePeriodEnder(month)).to.not.be.reverted;

    })
    
    it('stake period ender for addr2', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 2;
      await expect(Steelo2.connect(addr6).stakePeriodEnder(month)).to.not.be.reverted;

    })

    it('executive withdraw ether', async () => { 
  
      
      try {	
      		const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      		let num = 0.75;
		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo2.connect(owner).withdrawEther(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })
    
    it('executive donate Ether to Contract', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      await expect(Steelo2.connect(owner).donateEther({value: ethers.utils.parseEther("2")})).to.not.be.reverted;

    })

    it('Get Unstakers before', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let unstakers = await Steelo2.getUnstakers();
      console.log("Unstakers before :", unstakers);

    })


    



    it('unstake 90 STLO for addr1', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 90;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr2).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 10 STLO fir addr2', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 10;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr6).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('Get Unstakers after', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let unstakers = await Steelo2.getUnstakers();
      console.log("Unstakers after :", unstakers);

    })

    it('get ether balance of the contract after unstaking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
//      balance /= 10 ** 18;
      console.log("Contract Balance :", parseInt(balance));

    })

    it('should check account balance', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr2.address);
//      balance /= 10 ** 18;
      console.log("addr1 STLO balance after selling STLO :", parseInt(balance));

    })

    it('should burn 50 tokens', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let amount = 50;
      await expect(Steelo.connect(owner).steeloBurn(amount )).to.not.be.reverted;

    })

    it('should check total Supply', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let balance = await Steelo.steeloTotalSupply();
      balance /= 10 ** 18;
      console.log("total supply after owner burned 50 STLO again", parseInt(balance));

    })

    

    it('should check account balance of community provider', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr3.address);
      balance /= 10 ** 18;
      console.log("STLO balance of  community provider:", parseInt(balance));

    })

    it('should check account balance of founder provider', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr4.address);
      balance /= 10 ** 18;
      console.log("STLO balance of founder provider:", parseInt(balance));

    })

    it('should check account balance of early investor provider', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(addr5.address);
      balance /= 10 ** 18;
      console.log("STLO balance of  early investor:", parseInt(balance));

    })


    it('should expect transaction count to be zero', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      const transaction = await Steelo.getTotalTransactionAmount();
      console.log("total transaction count after some transactions :", parseInt(transaction));

    })

//    it('should create random transaction', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
//      await expect(Steelo.connect(owner).createRandomTransaction()).to.not.be.reverted;
//
//    })
//
//    it('should expect transaction count to be zero', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
//      const transaction = await Steelo.getTotalTransactionAmount();
//      console.log(transaction);
//
//    })

    


//    it('should calculate total transaction', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
//      await expect(Steelo.connect(owner).calculateTotalTransactionAmount()).to.not.be.reverted;
//
//    })


//    it('should expect transaction count to be seven', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
//      const transaction = await Steelo.getTotalTransactionAmount();
//      console.log(transaction);
//
//    })

//    it('should transfer balance from owner to someone else', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
//      let num = 5400;
//        let amount = ethers.utils.parseEther(num.toString());
//      await expect(Steelo.connect(owner).steeloTransfer(addr1.address, amount )).to.not.be.reverted;
//
//    })

//    it('should transfer balance from owner to someone else', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
//      let num = 54000;
//        let amount = ethers.utils.parseEther(num.toString());
//      await expect(Steelo.connect(owner).steeloTransfer(addr1.address, amount )).to.not.be.reverted;
//
//    })

//    it('should check total Supply', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
//      const balance = await Steelo.steeloTotalSupply();
//      console.log(balance);
//
//    })

//     it('should calcuate and mint on its own', async () => { 
//      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress);
//      await expect(Steelo.connect(owner).steeloMintAdvanced()).to.not.be.reverted;
//
//    })

//    it('should check total Supply', async () => { 
//  
//      const Steelo = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
//      const balance = await Steelo.steeloTotalSupply();
//      console.log(balance);
//
//    })

//    it('should add the Steelo 2 Facet', async () => {
//
//      const Steelo2Facet = await ethers.getContractFactory('STEELOAdminFacet')
//      const steelo2Facet = await Steelo2Facet.deploy()
//  
//      let selectors = getSelectors(steelo2Facet);
//      let addresses = [];
//      addresses.push(steelo2Facet.address);
//      
//      await diamondCutFacet.diamondCut([[steelo2Facet.address, FacetCutAction.Add, selectors]], ethers.constants.AddressZero, '0x');
//  
//      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]);
//      assert.sameMembers(result, selectors)
//  
//    }).timeout(600000)

    it('should check total Supply before supply cap', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let balance = await Steelo2.steeloTotalSupply();
      balance /= 10 ** 18;
      console.log("total supply before supply cap", parseInt(balance));

    })


    

    it('should check total Supply', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAttributesFacet', diamondAddress)
      let balance = await Steelo2.steeloTotalSupply();
      balance /= 10 ** 18;
      console.log("total supply after supply cap", parseInt(balance));

    })

    it('should check total Supply', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.steeloSupplyCap();
      balance /= 10 ** 18;
      console.log("supply cap after calculation :", parseInt(balance));

    })

    it('should check mint Rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.steeloMintRate();
      console.log("steelo mint rate", parseInt(balance), "/ 1000 %");

    })


//    it('should adjust mint rate', async () => { 
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
//      let amount = 60;
//      await expect(Steelo2.connect(owner).adjustMintRate(amount)).to.not.be.reverted;
//
//    })

//    it('should check min Rate', async () => { 
//  
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
//      const balance = await Steelo2.steeloMintRate();
//      console.log(balance);
//
//    })


    it('should check burn Rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.steeloBurnRate();
      console.log("steelo burn rate :", parseInt(balance), "/ 1000 %");

    })


//    it('should adjust burn rate', async () => { 
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
//      let amount = 60;
//      await expect(Steelo2.connect(owner).adjustBurnRate(amount)).to.not.be.reverted;
//
//    })

//    it('should check burn Rate', async () => { 
//  
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
//      const balance = await Steelo2.steeloBurnRate();
//      console.log(balance);
//
//    })

//    it('should check burn Amount before', async () => { 
//  
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
//      const balance = await Steelo2.steeloBurnAmount();
//      console.log(balance);
//
//    })

//    it('should adjust burn rate', async () => { 
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
//      await expect(Steelo2.connect(owner).burnSteeloTokens()).to.not.be.reverted;
//
//    })

//    it('should check burn Amount before', async () => { 
//  
//      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
//      const balance = await Steelo2.steeloBurnAmount();
//      console.log(balance);
//
//    })

    it('should check total burned Amount before', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.steeloTotalBurnAmount();
      balance /= 10 ** 18;
      console.log("total amount burned :", parseInt(balance));

    })
    it('should check total minted Amount before', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.steeloTotalMintAmount();
      balance /= 10 ** 18;
      console.log("total amount minted :", parseInt(balance));

    })

    

    

    it('executive withdraw ether', async () => { 
  
      
      try {	
      		const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      		let num = 0.75;
		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo2.connect(owner).withdrawEther(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 2;
      await expect(Steelo.connect(addr9).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 3;
      await expect(Steelo.connect(addr8).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 4;
      await expect(Steelo.connect(addr7).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('should convert ETH to Steelo', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      let month = 1;
      await expect(Steelo.connect(addr6).stakeSteelo({value: ethers.utils.parseEther("1")})).to.not.be.reverted;

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr9).getStakedBalance( addr9.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr9:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr8).getStakedBalance( addr8.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr8:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr7).getStakedBalance( addr7.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr7:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr6:", parseFloat(balance));

    })



    it('get contract balance after a lot of staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

    })

    it('should transfer 45 STLO from owner to addr2', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      		let num = 45;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr9).steeloTransfer(addr6.address, amount );
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('should transfer 10 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 45;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr8).steeloTransfer(addr6.address, amount )).to.not.be.reverted;

    })

    it('should transfer 10 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 62;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr7).steeloTransfer(addr9.address, amount )).to.not.be.reverted;

    })

    it('should transfer 10 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 29;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr6).steeloTransfer(addr7.address, amount )).to.not.be.reverted;

    })

    it('should transfer 10 STLO from owner to addr1', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOTransactionFacet', diamondAddress)
      let num = 100;
      let amount = ethers.utils.parseEther(num.toString());
      await expect(Steelo.connect(addr6).steeloTransfer(addr7.address, amount )).to.not.be.reverted;

    })


     it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr9).getStakedBalance( addr9.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr6:", parseFloat(balance));

    })

    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr8).getStakedBalance( addr8.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr5:", parseFloat(balance));

    })

    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr7).getStakedBalance( addr7.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr4:", parseFloat(balance));

    })

    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr3:", parseFloat(balance));

    })

    it('get staked ETH balance after staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address);
      balance /= 10 ** 18;
      console.log("Staked Balance of addr3:", parseFloat(balance));

    })

    it('stake period ender for addr9', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 3;
      await expect(Steelo2.connect(addr9).stakePeriodEnder(month)).to.not.be.reverted;

    })

    it('stake period ender for addr8', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 4;
      await expect(Steelo2.connect(addr8).stakePeriodEnder(month)).to.not.be.reverted;

    })

    it('stake period ender for addr7', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 5;
      await expect(Steelo2.connect(addr7).stakePeriodEnder(month)).to.not.be.reverted;

    })


    it('stake period ender for addr6', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 6;
      await expect(Steelo2.connect(addr6).stakePeriodEnder(month)).to.not.be.reverted;

    })


    it('stake period ender for addr2', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      let month = 1;
      await expect(Steelo2.connect(addr2).stakePeriodEnder(month)).to.not.be.reverted;

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

    it('unstake 100 STLO for addr8', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 50;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr8).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 100 STLO for addr7', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 100;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr7).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 100 STLO for addr6', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 29;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr6).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })

    it('unstake 100 STLO for addr2', async () => { 
  
      
      try {	
      		const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
      		let num = 60;
      		let amount = ethers.utils.parseEther(num.toString());
      		await Steelo.connect(addr2).unstakeSteelo(amount);
      		console.log('Transaction succeeded');
    	} catch (error) {
      		console.error('Transaction failed with error:', error.message);
    	}

    })


    it('get contract balance after a lot of staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

    })

    it('Balance of owner after stakers transaction', async () => { 
  
      const Steelo = await ethers.getContractAt('STEELOStakingFacet', diamondAddress)
      let balance = await Steelo.steeloBalanceOf(owner.address);
      balance /= 10 ** 18;
      console.log("owner balance after stakers transaction :", parseFloat(balance));

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

     it('get contract balance before a lot of staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

    })


    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr9).getStakedBalance( addr9.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr9:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr8).getStakedBalance( addr8.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr8:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr7).getStakedBalance( addr7.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr7:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr6:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })

    it('Addr2 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr2).getInterest( addr2.address );
      console.log("Interest addr2 :", parseFloat(interest));

    })
    

    it('Addr6 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr6).getInterest( addr6.address );
      console.log("Interest addr6 :", parseFloat(interest));

    })
          

    it('Addr7 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr7).getInterest( addr7.address );
      console.log("Interest addr7 :", parseFloat(interest));

    })
    

   

    it('Addr8 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr8).getInterest( addr8.address );
      console.log("Interest addr8 :", parseFloat(interest));

    })
    

   

    it('Addr9 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr9).getInterest( addr9.address );
      console.log("Interest addr9 :", parseFloat(interest));

    })
    

   

    it('Addr9 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr9).getInterest( addr9.address );
      console.log("Interest addr9 :", parseFloat(interest));

    })

	it('Get Unstakers before', async () => { 
  	
  	    const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
  	    let unstakers = await Steelo2.getUnstakers();
  	    console.log("Unstakers before :", unstakers);

  	  })
    
    


    it('executive donate Ether to Contract', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress);
      await expect(Steelo2.connect(owner).donateEther({value: ethers.utils.parseEther("2")})).to.not.be.reverted;

    })
    



//    it('Unstakers get what they were owed', async () => { 
//  
//      const Steelo2 = await ethers.getContractAt('STEELOStakingFacet', diamondAddress);
//      await expect(Steelo2.connect(addr2).steeloMintAdvanced()).to.not.be.reverted;
//
//    })

	it('Get Unstakers before', async () => { 
	  
	      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
	      let unstakers = await Steelo2.getUnstakers();
	      console.log("Unstakers before :", unstakers);
	
    	})
	

 
     it('Addr2 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr2).getInterest( addr2.address );
      console.log("Interest addr2 :", parseFloat(interest));

    })
    

    it('Addr6 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr6).getInterest( addr6.address);
      console.log("Interest addr6 :", parseFloat(interest));

    })
          

    it('Addr7 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr7).getInterest( addr7.address );
      console.log("Interest addr7 :", parseFloat(interest));

    })
    

   

    it('Addr8 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr8).getInterest( addr8.address );
      console.log("Interest addr8 :", parseFloat(interest));

    })
    

   

    it('Addr9 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr9).getInterest( addr9.address );
      console.log("Interest addr9 :", parseFloat(interest));

    })
    

   

    it('Addr9 Interest rate', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let interest = await Steelo2.connect(addr9).getInterest( addr9.address );
      console.log("Interest addr9 :", parseFloat(interest));

    })
    

    
    


    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr9).getStakedBalance( addr9.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr9:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr8).getStakedBalance( addr8.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr8:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr7).getStakedBalance( addr7.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr7:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr6).getStakedBalance( addr6.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr6:", parseFloat(balance));

    })

     
     it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })

    it('get staked ETH balance before staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.connect(addr2).getStakedBalance( addr2.address );
      balance /= 10 ** 18;
      console.log("Staked Balance of addr2:", parseFloat(balance));

    })
   
     it('get contract balance after a lot of staking:', async () => { 
  
      const Steelo2 = await ethers.getContractAt('STEELOAdminFacet', diamondAddress)
      let balance = await Steelo2.getContractBalance();
      balance /= 10 ** 18;
      console.log("Contract Balance :", parseFloat(balance));

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
   

    it('addr9 create steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      await expect(Steelo4.connect(addr9).createSteeloUser()).to.be.reverted;

    })

     it('user Identifier', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = await Steelo4.connect(addr9).profileIdUser( addr9.address);
      console.log("profileId of addr9 :", profileId)

    })

     it('executive  Identifier', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let isExecutive = await Steelo4.connect(owner).isExecutive( owner.address );
      console.log(`is owner executive :${isExecutive}`)

    })

     it('addr9 delete steelo user account', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      await expect(Steelo4.connect(addr9).deleteSteeloUser()).to.not.be.reverted;

    })
     it('user Identifier', async () => { 
 
      const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
      let profileId = await Steelo4.connect(addr9).profileIdUser( addr9.address);
      console.log("profileId of addr9 :", profileId)

    })
     it('addr9 create steelo user account', async () => { 
 
	try {
      		const Steelo4 = await ethers.getContractAt('ProfileFacet', diamondAddress);
		profileId = "dsfdsafsda"
      		await Steelo4.connect(addr9).createSteeloUser(profileId);
		console.log("transaction succeded");
	}
	     catch (error) {
		console.log("transaction failed", error.message);
	     }
	

    })
     
    
    

    

    

    

  });
    
 
	

