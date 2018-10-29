/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

const Web3 = require("web3");

module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "5777"
    },
    dev: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    test: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    staging_kaleido: {
      provider: () => {
        return new Web3.providers.HttpProvider("https://u0s8y9uqkr-u0hljh5kkz-rpc.us-east-2.kaleido.io", 0, "u0m0cod63q", "FZaEZpMQeCQyiet_e0cgDmiwsTuomfv_VVbUrLJsrE4");
      },
      network_id: "*",
      gasPrice: 0,
      gas: 4500000
    },
  },
};
