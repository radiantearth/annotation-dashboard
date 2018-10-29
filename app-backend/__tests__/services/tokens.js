const _ = require("lodash");
const tokenService = require("../../services/tokens");
const contractsService = require("../../services/contracts");
const cypher = require("../../utils/cypher");
const config = require("../../config");

describe("Tokens creation", () => {

  test("mint tokens should fail with a given invalid address", async() => {
    try {
      const address = 'A0x2a5bbfa9184099ef3cd69fa0b704bf4';
      const privKey = '0x6ac14f8f624fa3d7046102c12c930f48920bb4f0ef7088a93f8ffd6871c15dc7';
      const encPrivKey = cypher.encrypt(privKey, config.encSalt);
      const amount = 10;
      const tokensRes = await tokenService.mint(address, amount, encPrivKey);
    } catch(error) {
      expect(error);
    }
  });

  test("should mint tokens with a given valid address and amount", async() => {
    const address = '0x9499cd47847472fecf7880a128ae3b2bde56f9c6';
    const privKey = '0x6ac14f8f624fa3d7046102c12c930f48920bb4f0ef7088a93f8ffd6871c15dc7';
    const encPrivKey = cypher.encrypt(privKey, config.encSalt);
    const amount = 10;
    const tokensRes = await tokenService.mint(address, amount, encPrivKey);
    expect(!_.isNil(tokensRes))
    expect(!_.isEmpty(tokensRes.logs))
    expect(tokensRes.logs.length).toBe(2);
    expect(tokensRes.logs[0].event).toBe('Mint')
    expect(tokensRes.logs[0].args.to).toBe(address)
    expect(tokensRes.logs[0].args.amount.toNumber()).toBe(amount)
    expect(tokensRes.logs[1].event).toBe('Transfer')
  });

  test("check balance before and after tokens minting", async() => {
    const address = '0x9499cd47847472fecf7880a128ae3b2bde56f9c6';
    const privKey = '0x6ac14f8f624fa3d7046102c12c930f48920bb4f0ef7088a93f8ffd6871c15dc7';
    const encPrivKey = cypher.encrypt(privKey, config.encSalt);
    const amount = 10;
    const balanceBefore = await tokenService.balance(address);
    const tokensRes = await tokenService.mint(address, amount, encPrivKey);
    const balanceAfter = await tokenService.balance(address);
    expect(balanceAfter.toNumber()).toBe(balanceBefore.toNumber() + amount)
  });

})

describe("Deduct tokens rights", () => {
  test("check RE admin rights after tokens minting", async() => {
    const contractsData = await contractsService.getData();
    const address = '0x9499cd47847472fecf7880a128ae3b2bde56f9c6';
    const privKey = '0x6ac14f8f624fa3d7046102c12c930f48920bb4f0ef7088a93f8ffd6871c15dc7';
    const encPrivKey = cypher.encrypt(privKey, config.encSalt);
    const amount = 10;
    const tokensRes = await tokenService.mint(address, amount, encPrivKey);
    const allowanceRes = await contractsData.radiantCoin.allowance(address, contractsData.eventsMonitor.address);
    expect(allowanceRes.toNumber()).toBe(amount);
  });
})
