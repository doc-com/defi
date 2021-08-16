require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = process.env['PRIVATE_KEY'];
const infuraProjectId = process.env['INFURA_PROJECT_ID'];
const testServer = process.env['TEST_SERVER'];

module.exports = {
  compilers: {
    solc: {
      version: '0.6.12',
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      network_id: 1,
      networkCheckTimeout: 10000, // fixes truffle/infura bug
      provider: () => new HDWalletProvider(privateKey, 'wss://mainnet.infura.io/ws/v3/' + infuraProjectId),
    },
    ropsten: {
      network_id: 3,
      networkCheckTimeout: 10000, // fixes truffle/infura bug
      provider: () => new HDWalletProvider(privateKey, 'wss://ropsten.infura.io/ws/v3/' + infuraProjectId),
      skipDryRun: true,
    },
    rinkeby: {
      provider: () => new HDWalletProvider(privateKey, `https://rinkeby.infura.io/v3/29f0131a60c4424bb401b8834c78585f`),
      network_id: 4
    },
    smarttestnet: {
      provider: () => new HDWalletProvider(privateKey, `https://data-seed-prebsc-2-s1.binance.org:8545/`),
      network_id: 97
    },
    kovan: {
      network_id: 42,
      networkCheckTimeout: 10000, // fixes truffle/infura bug
      provider: () => new HDWalletProvider(privateKey, 'wss://kovan.infura.io/ws/v3/' + infuraProjectId),
      skipDryRun: true,
    },
    goerli: {
      network_id: 5,
      networkCheckTimeout: 10000, // fixes truffle/infura bug
      provider: () => new HDWalletProvider(privateKey, 'wss://goerli.infura.io/ws/v3/' + infuraProjectId),
      skipDryRun: true,
    },
    development: {
      network_id: 1,
      gas: 10000000,
      host: 'localhost',
      port: 8545,
      skipDryRun: true,
    },
    testing: {
      network_id: 1,
      gas: 10000000,
      host: testServer,
      port: 8545,
      skipDryRun: true,
    },
  }
};
