const EventsMonitor = artifacts.require("./EventsMonitor.sol");
const RadiantCoin = artifacts.require('./RadiantCoin.sol');
const config = require("../config");

contract('Events Monitor', function(accounts) {

  let reAdmin, user, coinInstance, monitorInstance;
  const burnAddress = config.tokens.burnAddress;
  const initialSupply = config.tokens.initialSupply;
  const downloadPrice = config.tokens.downloadPrice;
  const analyzePrice = config.tokens.analyzePrice;

  beforeEach("should prepare", () => {
    assert.isAtLeast(accounts.length, 2);
    reAdmin = accounts[0];
    user = accounts[1];

    return RadiantCoin.new(initialSupply, {from: reAdmin})
       .then(instance => {
         coinInstance = instance;
         return EventsMonitor.new(coinInstance.address, burnAddress, {from: reAdmin})
       })
       .then(instance => {
         monitorInstance = instance;
         return coinInstance.mint(user, initialSupply)
       })
  })

  it("should deduct tokens from org balance when download event is submitted", () => {
    let balanceBefore;
    return coinInstance.balanceOf(user)
        .then(balance => {
          balanceBefore = balance.toNumber();
          return coinInstance.approve(monitorInstance.address, initialSupply, {from: user})
        })
        .then(() => monitorInstance.download(user, downloadPrice, {from: reAdmin}))
        .then(() => coinInstance.balanceOf(user))
        .then(balanceAfter => assert.strictEqual(balanceAfter.toNumber(), balanceBefore - downloadPrice))
   });

   it("should deduct tokens from org balance when analyze event is submitted", () => {
     let balanceBefore;
     return coinInstance.balanceOf(user)
         .then(balance => {
           balanceBefore = balance.toNumber();
           return coinInstance.approve(monitorInstance.address, initialSupply, {from: user})
         })
         .then(() => monitorInstance.analyze(user, analyzePrice, {from: reAdmin}))
         .then(() => coinInstance.balanceOf(user))
         .then(balanceAfter => assert.strictEqual(balanceAfter.toNumber(), balanceBefore - analyzePrice))
    });

  it("should emit LogDownloadSuccess event", () => {
     return coinInstance.approve(monitorInstance.address, initialSupply, {from: user})
        .then(() => monitorInstance.download(user, downloadPrice, {from: reAdmin}))
        .then(downloadTx => {
          assert.strictEqual(downloadTx.logs.length, 1);
          const logCreated = downloadTx.logs[0];
          assert.strictEqual(logCreated.event, "LogDownloadSuccess");
          assert.strictEqual(logCreated.address, monitorInstance.address);
          assert.strictEqual(logCreated.args.user, user);
          assert.strictEqual(logCreated.args.reAdmin, reAdmin);
          assert.strictEqual(logCreated.args.token, coinInstance.address);
          assert.strictEqual(logCreated.args.burnAddress, burnAddress);
          assert.strictEqual(logCreated.args.amount.toNumber(), downloadPrice);
        })
   });

   it("should emit LogUploadSuccess event", () => {
      return monitorInstance.upload(user, {from: reAdmin})
         .then(uploadTx => {
           assert.strictEqual(uploadTx.logs.length, 1);
           const logCreated = uploadTx.logs[0];
           assert.strictEqual(logCreated.event, "LogUploadSuccess");
           assert.strictEqual(logCreated.address, monitorInstance.address);
           assert.strictEqual(logCreated.args.user, user);
           assert.strictEqual(logCreated.args.reAdmin, reAdmin);
         })
    });

    it("should emit LogViewSuccess event", () => {
       return monitorInstance.viewImage(user, {from: reAdmin})
          .then(uploadTx => {
            assert.strictEqual(uploadTx.logs.length, 1);
            const logCreated = uploadTx.logs[0];
            assert.strictEqual(logCreated.event, "LogViewSuccess");
            assert.strictEqual(logCreated.address, monitorInstance.address);
            assert.strictEqual(logCreated.args.user, user);
            assert.strictEqual(logCreated.args.reAdmin, reAdmin);
          })
    });


   it("expect a revert in smart contract when transfer of tokens is not allowed for download event", () => {
       return monitorInstance.download(user, downloadPrice, {from: reAdmin})
         .then(() => assert(false, "Expected error was not received"))
         .catch(err => assert(true))
   });

   it("expect a revert in smart contract when transfer of tokens is not allowed for analyze event", () => {
       return monitorInstance.analyze(user, analyzePrice, {from: reAdmin})
         .then(() => assert(false, "Expected error was not received"))
         .catch(err => assert(true))
   });

})
