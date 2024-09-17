require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require('solidity-coverage')
require("hardhat-diamond-abi");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
  
});

function filterDuplicateFunctions(abiElement, index, fullAbiL, fullyQualifiedName) {
  if (["function", "event"].includes(abiElement.type)) {
    const funcSignature = genSignature(abiElement.name, abiElement.inputs, abiElement.type);
    if (elementSeenSet.has(funcSignature)) {
      return false;
    }
    elementSeenSet.add(funcSignature);
  } else if (abiElement.type === 'event') {

  }

  return true;

}

const elementSeenSet = new Set();
// filter out duplicate function signatures
function genSignature(name, inputs, type) {
  return `${type} ${name}(${inputs.reduce((previous, key) => 
    {
      const comma = previous.length ? ',' : '';
      return previous + comma + key.internalType;
    }, '' )})`;
}

 module.exports = {
  solidity: '0.8.1',
  diamondAbi: {
    name: "steeloDiamond",
    include: ['Facet'],
    strict: true,
    filter: filterDuplicateFunctions,
  },
  paths: {
    sources: "/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    imports: [
      "node_modules",
      path.join(__dirname, 'node_modules/@uniswap/v4-core/src'),
      path.join(__dirname, 'node_modules/@uniswap/v4-periphery/src')
    ]
  },
  networks: {
    
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
	      process.env.GANACHE_ACCOUNT_1_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_2_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_3_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_4_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_5_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_6_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_7_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_8_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_9_PRIVATE_KEY, 
	      process.env.GANACHE_ACCOUNT_10_PRIVATE_KEY 
      ],
      timeout: 600000
    },
    stavanger: {
	    url: process.env.POLYGON_STAVANGER_RPC_URL,
	    accounts: [
		process.env.TESTNET_ACCOUNT_1_PRIVATE_KEY	    
	    ],
    },
    cardona: {
	    url: process.env.POLYGON_CARDONA_RPC_URL,
	    accounts: [
		process.env.TESTNET_ACCOUNT_1_PRIVATE_KEY
	    ],
	    gasPrice: 5000000000,
    },
    sepolia: {
	   url: process.env.ALCHEMY_SEPOLIA_RPC_URL,
	    accounts: [
		process.env.TESTNET_ACCOUNT_1_PRIVATE_KEY
	    ],
    }

    
  },

  
};
