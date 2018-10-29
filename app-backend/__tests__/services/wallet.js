const _ = require("lodash");
const Wallet = require("../../models/wallet");
const walletService = require("../../services/wallet");

describe("Wallet creation", () => {

  test("should not create a wallet without an orgId", async () => {
    try {
      const wallet = await walletService.createWallet();
    } catch (error) {
      expect(error);
    }
  });

  test("should create a wallet with all the attributes", async () => {
    const orgId = "abc123";
    const walletObj = await walletService.createWallet(orgId);
    const wallet = walletObj.toJSON();
    const walletFromDB = await Wallet.findOne({where: {orgId}});
    expect(_.isEqual(wallet, walletFromDB.toJSON()));
    expect(!_.isEmpty(wallet.privateKey));
    expect(!_.isEmpty(wallet.publicKey));
    expect(!_.isEmpty(wallet.address));
  });

  test("should only create one wallet for an org", async () => {
    const orgId = "abc123";
    const wallet1 = await walletService.createWallet(orgId);
    const wallet2 = await walletService.createWallet(orgId);
    expect(_.isEqual(wallet1.toJSON(), wallet2.toJSON()));
  });
})