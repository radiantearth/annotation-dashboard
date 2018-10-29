const sequelize = require("../db");
const Wallet = require("./wallet");
const Organization = require("./organization");
const Event = require("./event");

// Initialize all the models
async function init() {
  return sequelize.sync();
}

module.exports = {init};