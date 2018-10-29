const _ = require("lodash");
const bip39 = require('bip39');
const debug = require("debug")("re:services:wallet");
const ethWallet = require("ethereumjs-wallet");
const Wallet = require("../models/wallet");
const tokensService = require("../services/tokens");
const config = require("../config");
const cypher = require("../utils/cypher");

function _generateWallet(orgId) {
  const mnemonic = bip39.generateMnemonic();
  const mnemonicString = bip39.mnemonicToSeed(mnemonic);
  return ethWallet.generate(mnemonicString);
}

async function createWallet(orgId) {
  return new Promise(async (resolve, reject) => {
    if (!orgId) {
      return reject({error: "orgId is required to create a wallet"});
    }

    // check if there is already a wallet for this org
    let orgWallet = await Wallet.findOne({where: {orgId}});
    if (!_.isEmpty(orgWallet)) {
      return resolve(orgWallet);
    }

    const newWallet = _generateWallet(orgId);
    const publicKey = newWallet.getPublicKeyString();
    const privateKey = cypher.encrypt(newWallet.getPrivateKeyString(), config.encSalt);
    const address = newWallet.getAddressString();

    const createParams = {
      orgId,
      privateKey,
      publicKey,
      address
    }
    Wallet.create(createParams).then(newWallet => {
      return resolve(newWallet);
    });
  });
}

function resolveMissingWallet(resolve, address) {
  return resolve({address: address, balance: 0, initialMintTxHash: ""});
}

//returns wallet address and balance, used in organization retrieval
async function getWalletInfo(orgId) {
  return new Promise(async (resolve, reject) => {
    if (!orgId) {
      return reject({error: "orgId is required to create a wallet"});
    }

    let orgWallet = await Wallet.findOne({where: {orgId}});
    if (_.isEmpty(orgWallet)) {
      debug("Wallet for `${orgId}` organization was not found");
      return resolveMissingWallet(resolve);
    }

    let wallet = orgWallet.toJSON();
    tokensService.balance(wallet.address)
    .then(balance => {
      resolve({address: wallet.address, balance: balance.toNumber(), initialMintTxHash: wallet.initialMintTxHash});
    })
    .catch(err => {
      debug("Failed to retrieve wallet `${wallet.address}` info", err)
      return resolveMissingWallet(resolve, wallet.address);
    })
 })
}

module.exports = {createWallet, getWalletInfo};
