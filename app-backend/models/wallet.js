const Sequelize = require("sequelize");
const sequelize = require("../db");

const indexes = [
  { unique: true,
    fields: ["orgId"]
  }
]

const Wallet = sequelize.define("wallet", {
  orgId: Sequelize.STRING,
  privateKey: Sequelize.STRING,
  publicKey: Sequelize.STRING,
  address: Sequelize.STRING,
  initialMintTxHash: Sequelize.STRING,
}, indexes);

module.exports = Wallet;