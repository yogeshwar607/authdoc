const HDWalletProvider = require('truffle-hdwallet-provider')
require('dotenv').config()

const key = process.env.MNEMONIC  || 'stuff omit quiz inform fly sand surface truck truck other olympic sorry'
  // 12 word mnemonic 
const rinkyByUrl = 'https://rinkeby.infura.io/8Ofq8yj9gcP6EVmKD3NG';

module.exports = {
  networks: {
    rinkeby: {
      provider: new HDWalletProvider(key, rinkyByUrl), 
      network_id: '*',
      gas: 4712383,
      gasPrice: 20000000000
    },
    mainnet: {
      provider: new HDWalletProvider(key, 'https://mainnet.infura.io'),
      network_id: 1,
      gas: 4500000,
      gasPrice: 10000000000
    }
  }
};
