const _ = require("lodash");
const Organization = require("../models/organization");
const Wallet = require("../models/wallet")
const walletService = require("./wallet");
const tokensService = require("../services/tokens");
const config = require("../config");
const initialSupply = config.tokens.initialSupply;

async function createOrganization(params) {
  return new Promise(resolve => {
    Organization.findOne({where: {orgId: params.orgId}}).then(org => {
      if (!_.isEmpty(org)) {
        return resolve(org.toJSON());
      }
      Organization.findOrCreate({where: params}).then(orgs => {
        walletService.createWallet(params.orgId).then(wallet => {
          tokensService.mint(wallet.address, initialSupply, wallet.privateKey).then(trx => {
            wallet.updateAttributes({initialMintTxHash: trx.tx}).then(() => {
              resolve(orgs[0].toJSON());
            });
          })
        });
      });
    });
  });
}

async function getOrganizations() {
  return new Promise((resolve, reject) => {
    Organization.findAll().then(orgs => {
      let walletsData = []
      let orgsJSON = orgs.map(org => {
        walletsData.push(walletService.getWalletInfo(org.toJSON().orgId));
        return org.toJSON();
      });
      Promise.all(walletsData).then(values => {
        values.forEach((value, index) => {
          orgsJSON[index].address = value.address;
          orgsJSON[index].balance = value.balance;
          orgsJSON[index].initialMintTxHash = value.initialMintTxHash;
        });
        resolve(orgsJSON);
      });
    });
  });
}

async function getOrganization(orgId) {
  return new Promise((resolve, reject) => {
    Organization.findOne({where: {orgId}}).then(org => {
      if (_.isEmpty(org)) {
        return resolve({});
      }
      walletService.getWalletInfo(orgId).then(info => {
        const orgJSON = org.toJSON();
        orgJSON.wallet = info.address;
        orgJSON.balance = info.balance;
        orgJSON.initialMintTxHash = info.initialMintTxHash;
        return resolve(orgJSON);
      })
    });
  });
}

module.exports = {createOrganization, getOrganizations, getOrganization}
