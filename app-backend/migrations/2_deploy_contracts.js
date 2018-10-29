const RadiantCoin = artifacts.require('./RadiantCoin.sol');
const EventsMonitor = artifacts.require('./EventsMonitor.sol');
const config = require("../config");

module.exports = function(deployer) {
  deployer.deploy(RadiantCoin, config.tokens.initialSupply)
   .then(instance => deployer.deploy(EventsMonitor, instance.address, config.tokens.burnAddress))
}
