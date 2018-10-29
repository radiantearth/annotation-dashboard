const _ = require('lodash')
const contract = require('truffle-contract')

const config = require("../config");
const web3 = config.web3;


let contractsData = {};

async function getData() {
  return new Promise((resolve, reject) => {

    if (!_.isEmpty(contractsData)) {
      return resolve(contractsData);
    }

    let RadiantCoin = contract(require('../build/contracts/RadiantCoin.json'));
    RadiantCoin.setProvider(web3.currentProvider);

    let EventsMonitor = contract(require('../build/contracts/EventsMonitor.json'));
    EventsMonitor.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accounts) {
      if (err != null) {
        return reject(err);
      }

      if (!accounts || accounts.length == 0) {
        return reject({error: "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."});
      }

      contractsData.accounts = accounts;

      RadiantCoin.deployed()
        .then(instance => {
          contractsData.radiantCoin = instance;
          return EventsMonitor.deployed();
         })
        .then(instance => {
          contractsData.eventsMonitor = instance;
          return resolve(contractsData);
         })
        .catch(err => reject({error: "Deploying of contracts failed with an error" + err}))
    });
  })
}

module.exports = {getData}
