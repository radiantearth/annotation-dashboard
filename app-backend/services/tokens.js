const _ = require('lodash')
const ethereumTx = require('ethereumjs-tx');
const abi = require('ethereumjs-abi');
const contractsService = require("./contracts");
const debug = require("debug")("re:services:tokens");

const config = require("../config");
const web3 = config.web3;
const cypher = require("../utils/cypher");


async function mint(address, amount, privateKey) {
  return new Promise((resolve, reject) => {
    contractsService.getData()
    .then(contractsData => contractsData.radiantCoin.mint(address, amount, {from: contractsData.accounts[0]}))
    .then(mintTx => {
      approveTransferForREAdmin(address, amount, privateKey)
       .then(approveTx => {
         debug("Approve Tx = ", approveTx);
         return resolve(mintTx)
       })
       .catch(err => reject({error: "Approving rights of RE admin to move tokens failed with error = " + err}))
     })
    .catch(err => reject({error: "Minting of tokens failed with an error = " + err}))
  });
}

async function approveTransferForREAdmin(address, amount, privateKey) {
  let contractsData;
  return new Promise((resolve, reject) => {
    contractsService.getData()
      .then(data => {
        contractsData = data;
        return web3.eth.getTransactionCount(address);
      })
      .then(count => {
        const methodEncoded = web3.sha3("approve(address,uint256)").substr(0,10);
        const paramTypes = ["address", "uint256"];
        const paramValues = [contractsData.eventsMonitor.address, amount];
        const paramEncoded = abi.rawEncode(paramTypes, paramValues);
        const dataEncoded = methodEncoded + paramEncoded.toString('hex');

        const txParams = {
          nonce: '0x' + count.toString(16),
          //gasPrice: '0x09184e72a000',
          gasLimit: config.tokens.gasLimit,
          to: contractsData.radiantCoin.address,
          from: address,
          data: dataEncoded
        }

        const tx = new ethereumTx(txParams);
        const decryptedKey = cypher.decrypt(privateKey, config.encSalt);
        const keyBuffer = Buffer.from(decryptedKey.substr(2), 'hex');
        tx.sign(keyBuffer);
        const serializedTx = tx.serialize();
        const rawTx = '0x' + serializedTx.toString('hex');
        return web3.eth.sendRawTransaction(rawTx);
      })
      .then(resTx => resolve(resTx))
      .catch(err => reject(err))
  })
}

async function balance(address) {
  return new Promise((resolve, reject) => {
    contractsService.getData()
    .then(contractsData => contractsData.radiantCoin.balanceOf(address))
    .then(balance => resolve(balance))
    .catch(err => reject({error: `Getting balance for ${address} failed with an error = ${err}`}))
  });

}

module.exports = {mint, balance}
