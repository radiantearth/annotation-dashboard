const Sequelize = require("sequelize");
const sequelize = require("../db");

const indexes = [
  { unique: true,
    fields: ["orgId"]
  }
]

const Organization = sequelize.define("organization", {
  orgId: Sequelize.STRING,
  name: Sequelize.STRING,
  systemOfOrigin: Sequelize.STRING,
  ownerId: Sequelize.STRING,
  verified: Sequelize.BOOLEAN,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, indexes);

module.exports = Organization;
