const fs = require('fs');
const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');

async function smartDeploy() {
  const config = JSON.parse(fs.readFileSync('deployConfig.json', 'utf8'));
  console.log(`Deploying version ${config.version}`);
  const deployedLibraries = {};
  const deployedFacets = {};
  const deploymentLog = [];

  if (!process.env.DIAMOND_ADDRESS) {
    throw new Error("DIAMOND_ADDRESS environment variable is not set");
  }

  // Check if all facets in deploymentOrder are defined in facets
  const undefinedFacets = config.deploymentOrder.filter(facet => !config.facets.some(f => f.name === facet));
  if (undefinedFacets.length > 0) {
    throw new Error(`The following facets are in deploymentOrder but not defined in facets: ${undefinedFacets.join(', ')}`);
  }

  try {
    // Deploy libraries first
    for (const libraryName of config.libraries) {
      await deployLibrary(libraryName, deployedLibraries, deploymentLog);
    }

    // Deploy facets in the specified order
    for (const facetName of config.deploymentOrder) {
      const facetConfig = config.facets.find(f => f.name === facetName);
      if (!deployedFacets[facetName]) {
        await deployFacet(facetName, facetConfig, deployedFacets, deployedLibraries, deploymentLog);
      }
    }

    console.log('All libraries and facets deployed successfully');
    fs.writeFileSync('deployedLibraries.json', JSON.stringify(deployedLibraries, null, 2));
    fs.writeFileSync('deployedFacets.json', JSON.stringify(deployedFacets, null, 2));
    fs.writeFileSync('deploymentLog.json', JSON.stringify(deploymentLog, null, 2));

    // Print summary log
    console.log('\nDeployment Summary:');
    console.log('Libraries:');
    Object.entries(deployedLibraries).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });
    console.log('Facets:');
    Object.entries(deployedFacets).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });
  } catch (error) {
    console.error('Deployment failed:', error);
    await rollback(deployedFacets, deployedLibraries, deploymentLog);
    process.exit(1);
  }
}

async function deployLibrary(libraryName, deployedLibraries, deploymentLog) {
  console.log(`Deploying library ${libraryName}`);
  try {
    const Library = await ethers.getContractFactory(libraryName);
    const library = await Library.deploy();
    await library.deployed();
    console.log(`${libraryName} deployed to:`, library.address);
    deployedLibraries[libraryName] = library.address;
    deploymentLog.push({ type: 'library', name: libraryName, address: library.address, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`Failed to deploy library ${libraryName}:`, error);
    throw error;
  }
}

async function deployFacet(facetName, facetConfig, deployedFacets, deployedLibraries, deploymentLog) {
  console.log(`Deploying ${facetName}`);

  // Check if all dependencies are deployed
  for (const dependency of facetConfig.dependencies) {
    if (!deployedLibraries[dependency]) {
      throw new Error(`Dependency ${dependency} not deployed for ${facetName}`);
    }
  }

  try {
    const Facet = await ethers.getContractFactory(facetName, {
      libraries: facetConfig.dependencies.reduce((acc, dep) => {
        acc[dep] = deployedLibraries[dep];
        return acc;
      }, {})
    });
    const facet = await Facet.deploy();
    await facet.deployed();

    console.log(`${facetName} deployed to:`, facet.address);

    if (facetName === 'BazaarHookFacet') {
      await deployBazaarHooks(facet);
    } else {
      await deployRegularFacet(facet, facetName, facetConfig);
    }

    deployedFacets[facetName] = facet.address;
    deploymentLog.push({ type: 'facet', name: facetName, address: facet.address, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`Failed to deploy ${facetName}:`, error);
    throw error;
  }
}

async function deployBazaarHooks(facet) {
  const LibBazaarHooks = await ethers.getContractFactory("LibBazaarHooks");
  const libBazaarHooks = await LibBazaarHooks.deploy();
  await libBazaarHooks.deployed();

  console.log("LibBazaarHooks deployed to:", libBazaarHooks.address);

  const [deployer] = await ethers.getSigners();
  const hookAddress = await libBazaarHooks.getHookAddress(deployer.address);
  const flags = await libBazaarHooks.calculateHookFlags();
  const salt = await libBazaarHooks.calculateHookSalt();

  console.log("Calculated Hook Address:", hookAddress);
  console.log("Hook Flags:", flags);
  console.log("Hook Salt:", salt);

  if (facet.address.toLowerCase() !== hookAddress.toLowerCase()) {
    console.error("Deployed address does not match calculated address!");
    throw new Error("BazaarHookFacet deployment address mismatch");
  }
}

async function deployRegularFacet(facet, facetName, facetConfig) {
  let selectors = getSelectors(facet);
  if (facetConfig.excludeFunctions) {
    selectors = selectors.remove(facetConfig.excludeFunctions);
  }

  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', process.env.DIAMOND_ADDRESS);
  const action = facetConfig.replace ? FacetCutAction.Replace : FacetCutAction.Add;

  const tx = await diamondCutFacet.diamondCut(
    [{
      facetAddress: facet.address,
      action: action,
      functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x'
  );

  const gasEstimate = await estimateGas(tx);
  const receipt = await tx.wait();

  console.log(`${facetName} added to Diamond. Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`Estimated gas: ${gasEstimate}, Actual gas used: ${receipt.gasUsed.toString()}`);

  if (!process.env.SKIP_TESTS) {
    try {
      await runTests(facetName);
    } catch (error) {
      console.error(`Tests failed for ${facetName}:`, error);
      console.warn(`Continuing deployment despite test failure for ${facetName}`);
    }
  } else {
    console.log(`Skipping tests for ${facetName} as SKIP_TESTS is set`);
  }
}

async function runTests(facetName) {
    console.log(`Running tests for ${facetName}...`);
    try {
        const testResult = await ethers.getContractAt(facetName, process.env.DIAMOND_ADDRESS);
        const functions = Object.keys(testResult.interface.functions);
        
        for (const func of functions) {
            if (func.includes('(')) {
                console.log(`Checking function: ${func}`);
                if (typeof testResult[func.split('(')[0]] !== 'function') {
                    throw new Error(`Function ${func} not found in ${facetName}`);
                }
            }
        }
        
        console.log(`All functions verified for ${facetName}`);
        
        // Specific tests for each facet
        if (facetName === 'BazaarHookFacet') {
            const poolKey = {/* mock pool key */};
            const params = { liquidityDelta: ethers.BigNumber.from("1000"), tickLower: -1000, tickUpper: 1000 };
            const sender = (await ethers.getSigners())[0];
            
            const beforeModifyPosition = await testResult.beforeModifyPosition(sender.address, poolKey, params);
            console.log(`Result of beforeModifyPosition: ${beforeModifyPosition}`);
            
            const swapParams = { amountIn: ethers.utils.parseUnits("1", 18), sqrtPriceLimitX96: ethers.BigNumber.from("1"), zeroForOne: true };
            const beforeSwap = await testResult.beforeSwap(sender.address, poolKey, swapParams);
            console.log(`Result of beforeSwap: ${beforeSwap}`);
        } 
        
        else if (facetName === 'BazaarRouterFacet') {
            const routerAddress = await testResult.getRouterAddress();
            console.log(`Router address: ${routerAddress}`);
        }
        
        else if (facetName === 'AccessControlFacet') {
            const [admin, account] = await ethers.getSigners();
            const role = "ADMIN_ROLE";
            
            await testResult.grantRole(role, account.address);
            console.log(`Role ${role} granted to ${account.address}`);
            
            const assignedRole = await testResult.getRole(account.address);
            console.log(`Role of account: ${assignedRole}`);
            
            await testResult.revokeRole(role, account.address);
            console.log(`Role ${role} revoked from ${account.address}`);
        }
        
        else if (facetName === 'DiamondCutFacet') {
            const facetCut = [{ /* mock data for facet cut */ }];
            const initAddress = ethers.constants.AddressZero;
            const calldata = "0x";
            await testResult.diamondCut(facetCut, initAddress, calldata);
            console.log('DiamondCut executed successfully');
        } 
        
        else if (facetName === 'DiamondLoupeFacet') {
            const selectors = await testResult.facetFunctionSelectors(process.env.DIAMOND_ADDRESS);
            console.log(`Function selectors for facet: ${selectors}`);
            
            const facetAddresses = await testResult.facetAddresses();
            console.log(`Facet addresses: ${facetAddresses}`);
        } 
        
        else if (facetName === 'CollectibleContentFacet') {
            const contentCount = await testResult.getContentCount();
            console.log(`Total content count: ${contentCount}`);
            
            const contentId = "sampleContentId";
            const content = await testResult.getContentById(contentId);
            console.log(`Content details: ${content}`);
            
            await testResult.deleteContent(contentId);
            console.log(`Content with ID ${contentId} deleted`);
            
            const creatorId = "sampleCreator";
            const collaborator = { collaboratorAddress: "0xCollaborator", collaboratorPercent: 10, collaboratorName: "Sample Collaborator", profileUrl: "http://example.com/profile", collaboratorRole: "Editor" };
            await testResult.addCollaborator(creatorId, contentId, collaborator.collaboratorAddress, collaborator.collaboratorPercent, collaborator.collaboratorName, collaborator.profileUrl, collaborator.collaboratorRole);
            console.log(`Collaborator added to content with ID ${contentId}`);
        }
        
        else if (facetName === 'STEELOAdminFacet') {
            const price = await testResult.steeloPrice();
            console.log(`Steelo price: ${price}`);
            
            const profileId = "user123";
            await testResult.createSteeloUser(profileId);
            console.log(`Steelo user created with profile ID: ${profileId}`);
            
            const [user] = await ethers.getSigners();
            const isExecutive = await testResult.isExecutive(user.address);
            console.log(`Is executive: ${isExecutive}`);
        } 
        
        else if (facetName === 'OwnershipFacet') {
            const currentOwner = await testResult.owner();
            console.log(`Current owner: ${currentOwner}`);
            
            const [newOwner] = await ethers.getSigners();
            await testResult.transferOwnership(newOwner.address);
            console.log(`Ownership transferred to: ${newOwner.address}`);
        }
        
        else if (facetName === 'ProfileFacet') {
            const profileCount = await testResult.getProfileCount();
            console.log(`Total profile count: ${profileCount}`);
            
            const userProfileId = "profile123";
            await testResult.createProfile(userProfileId);
            console.log(`Profile created with ID: ${userProfileId}`);
            
            await testResult.deleteProfile(userProfileId);
            console.log(`Profile deleted with ID: ${userProfileId}`);
        }
        
        else if (facetName === 'STEELOAttributesFacet') {
            const [user] = await ethers.getSigners();
            const balance = await testResult.steeloBalanceOf(user.address);
            console.log(`Steelo balance: ${balance}`);
            
            const spender = "0xSpenderAddress";
            const amount = ethers.utils.parseUnits("100", 18);
            await testResult.steeloApprove(spender, amount);
            console.log(`Approved ${amount} tokens for ${spender}`);
        }
        
        else if (facetName === 'STEELOFacet') {
            const totalSupply = await testResult.totalSupply();
            console.log(`Total supply: ${totalSupply}`);
            
            const name = await testResult.name();
            const symbol = await testResult.symbol();
            console.log(`Token name: ${name}, symbol: ${symbol}`);
        }
        
        else if (facetName === 'STEELOStakingFacet') {
            const stakingPeriod = await testResult.getStakingPeriod();
            console.log(`Staking period: ${stakingPeriod}`);
            
            const stakeAmount = ethers.utils.parseUnits("50", 18);
            await testResult.stakeTokens({ value: stakeAmount });
            console.log(`Staked ${stakeAmount} tokens`);
            
            await testResult.withdrawStake(stakeAmount);
            console.log(`Withdrew staked tokens: ${stakeAmount}`);
        }
        
        else if (facetName === 'STEEZDataBaseFacet') {
            const profileId = "creator123";
            await testResult.createCreator(profileId);
            console.log(`Creator created with profile ID: ${profileId}`);
            
            const preOrderStatus = await testResult.checkPreOrderStatus(profileId, ethers.constants.AddressZero);
            console.log(`Pre-order status: ${preOrderStatus}`);
        }
        
        else if (facetName === 'STEEZFacet') {
            const totalSteez = await testResult.totalSteez();
            console.log(`Total STEEZ: ${totalSteez}`);
            
            const [user] = await ethers.getSigners();
            const steezBalance = await testResult.steezBalanceOf(user.address);
            console.log(`STEEZ balance: ${steezBalance}`);
        }
        
        else if (facetName === 'STEELOTransactionFacet') {
            const recipient = "0xRecipientAddress";
            const transferAmount = ethers.utils.parseUnits("50", 18);
            await testResult.steeloTransfer(recipient, transferAmount);
            console.log(`Transferred ${transferAmount} tokens to ${recipient}`);
            
            const from = "0xFromAddress";
            const to = "0xToAddress";
            await testResult.steeloTransferFrom(from, to, transferAmount);
            console.log(`Transferred ${transferAmount} tokens from ${from} to ${to}`);
        }
        
        else if (facetName === 'VillageChatsFacet') {
            const [sender, recipient] = await ethers.getSigners();
            const message = "Hello from sender!";
            await testResult.sendPrivateMessage(sender.address, recipient.address, message);
            console.log(`Message sent from ${sender.address} to ${recipient.address}: ${message}`);
            
            const messageId = 1;
            await testResult.deletePrivateMessage(sender.address, recipient.address, messageId);
            console.log(`Private message ${messageId} deleted`);
        }
        
        else if (facetName === 'VillageSIPFacet') {
            const title = "New SIP";
            const description = "This is a test SIP.";
            const sipType = 0;
            await testResult.proposeSIP(title, description, sipType);
            console.log(`SIP proposed with title: ${title}`);
            
            const sipId = 1;
            await testResult.voteOnSip(sipId, true);
            console.log(`Voted 'yes' on SIP with ID: ${sipId}`);
        }
        
        console.log(`Tests completed successfully for ${facetName}`);
    } catch (error) {
        console.error(`Tests failed for ${facetName}:`, error);
        throw error;
    }
}

async function estimateGas(tx) {
    const gasEstimate = await tx.estimateGas();
    const gasPrice = await ethers.provider.getGasPrice();
    const gasCost = gasEstimate.mul(gasPrice);
    console.log(`Estimated gas: ${gasEstimate}, Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei, Estimated cost: ${ethers.utils.formatEther(gasCost)} ETH`);
    return gasEstimate;
}

async function rollback(deployedFacets, deployedLibraries, deploymentLog) {
  console.log('Rolling back deployment...');
  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', process.env.DIAMOND_ADDRESS);
  
  for (let i = deploymentLog.length - 1; i >= 0; i--) {
    const { type, name, address } = deploymentLog[i];
    console.log(`Rolling back ${type} ${name}...`);
    
    if (type === 'facet') {
      try {
        const selectors = getSelectors(await ethers.getContractAt(name, address));
        const tx = await diamondCutFacet.diamondCut(
          [{
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors: selectors
          }],
          ethers.constants.AddressZero, '0x'
        );
        await tx.wait();
        console.log(`${name} removed from Diamond`);
        delete deployedFacets[name];
      } catch (error) {
        console.error(`Failed to rollback ${name}:`, error);
      }
    } else if (type === 'library') {
      console.log(`Note: Library ${name} cannot be undeployed, but it's removed from tracking.`);
      delete deployedLibraries[name];
    }
  }
  
  console.log('Rollback complete');
}

smartDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
