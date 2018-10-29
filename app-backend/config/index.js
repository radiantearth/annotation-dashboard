const truffleConfig = require("../truffle");
const Web3 = require("web3");

const DEFAULT_HTTP_PROVIDER = "http://localhost:8545";

let config = {}
config.postgres = {
  "host": "localhost",
  "port": "5432",
  "database": "postgres",
  "user": "postgres",
  "password": "postgres"
}
config.tokens = {
  "initialSupply": 1000000,
  "gasLimit": "0x30000",
  "downloadPrice": 5,
  "analyzePrice": 1,
  "burnAddress": "0x000000000000000000000000000000000000dead"
}
config.radiantEarthAPI = {
  url: "https://api.radiant.earth",
  authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9ETkRPREF4T1RsRVFVSTFPREl5T0RFNU16UTJORGN5T0RBNE5qbEJRa1l4UXpNeU4wTkRPQSJ9.eyJodHRwczovL2FwcC5yYXN0ZXJmb3VuZHJ5LmNvbTtwbGF0Zm9ybSI6Ijk4M2ZmYzljLTZiMzItNDdiMi1hMjVhLTU4Zjc0NTg2ZGUxNCIsImh0dHBzOi8vYXBwLnJhc3RlcmZvdW5kcnkuY29tO29yZ2FuaXphdGlvbiI6IjFjNmYzYjQzLTM3NDktNDQ4MC1hZmY3LTBjZmFjOTViNDgxOSIsImlzcyI6Imh0dHBzOi8vcmFzdGVyLWZvdW5kcnkuYXV0aDAuY29tLyIsInN1YiI6Im9hdXRoMnxSYWRpYW50RWFydGh8Z2l0aHVifDczOTk2MiIsImF1ZCI6IngySDBrMkFtS1phanRmVlFUMmRJRnhwOXJSdW80dzhvIiwiaWF0IjoxNTMyNTUwMjE3LCJleHAiOjE1MzI1ODYyMTd9.i7-jPMBBk4gPz1AT9TOutJXrVP9jm5rzpevhugZgJ8LgXS8CTNwQ3dpM2AW5MCbI2ZpLqg57LJfiQKvQAiJTMnQ4g_JZwQU67RFURaBY5dSiSrFllPTYXewSyaFWjjpp1B8ho_TuQglPIdtG8AL4FsOEll0aVrnwkPqgEuYDIzrBgqJlLzDt_1nFkyLEl5XOhBNLRauUFqpZpSTMx_la1f7cjjZdCfq-l1RnuLh6z1nsBWhesjlg0Xiwb1RrBkLJpYivBRJOEndlln1NfCHv0NV0OTeiPM44N5vZNCdVjMhmgtw3yGbc14bQTpkXfCHeUdZmFGUnVdlHyUXGez_vPQ",
  testSceneId: "fc7646fa-f6b9-42ef-9289-37fc9282260d"
}

config.maxBlockGas = 4712388;
config.QUERY_LIMIT = 50;

config.web3 = new Web3(new Web3.providers.HttpProvider(DEFAULT_HTTP_PROVIDER));

if (process.env.NODE_ENV == "test") {
  config.postgres.database = "re-test";
}

if (process.env.NODE_ENV == "staging") {
  config.web3 = new Web3(truffleConfig.networks.staging_kaleido.provider());
}

config.encSalt = "dslfnasgnsat40e8234jtgjvskfnsdo980nfasld"

module.exports = config;
