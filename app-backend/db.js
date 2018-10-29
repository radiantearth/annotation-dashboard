const config = require("./config");
const Sequelize = require("sequelize");
const pgConfig = config.postgres;

const dbOptions = {
  host: pgConfig.host,
  dialect: "postgres",
  logging: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

const sequelize = new Sequelize(pgConfig.database, pgConfig.user, pgConfig.password, dbOptions);
module.exports = sequelize;