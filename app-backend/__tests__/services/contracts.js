const _ = require("lodash");
const contractsService = require("../../services/contracts");

describe("Retrieval of contracts and accounts data", () => {

  test("should get accounts and instances of token and monitor contracts", async () => {
     const contractsData = await contractsService.getData();
     expect(!_.isNil(contractsData) && !_.isEmpty(contractsData)).toBeTruthy();
     expect(!_.isNil(contractsData.accounts) && !_.isEmpty(contractsData.accounts)).toBeTruthy();
     expect(!_.isNil(contractsData.eventsMonitor) && !_.isEmpty(contractsData.eventsMonitor)).toBeTruthy();
     expect(!_.isNil(contractsData.radiantCoin) && !_.isEmpty(contractsData.radiantCoin)).toBeTruthy();
  });
})
