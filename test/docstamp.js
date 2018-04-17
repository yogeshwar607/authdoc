const moment = require('moment')
const {sha3} = require('ethereumjs-util')

const DocAuth = artifacts.require('./DocAuth.sol')

function getLastEvent(instance) {
  return new Promise((resolve, reject) => {
    instance.allEvents()
    .watch((error, log) => {
      if (error) return reject(error)
      resolve(log)
    })
  })
}

contract('DocAuth', function(account) {
  it('should create a record', async function() {
    try {
      const instance = await DocAuth.deployed()
      // SHA-256 of file
      const msg = '7e5941f066b2070419995072dac7323c02d5ae107b23d8085772f232487fecae'
      const hash = web3.sha3(msg)

      await instance.authNewDoc(hash,"author","title","name");

      const eventObj = await getLastEvent(instance)
      assert.equal(eventObj.event, '_NewDocAuth')

    } catch(error) {
      //console.error(error)
      assert.equal(error, undefined)
    }
  })
})
