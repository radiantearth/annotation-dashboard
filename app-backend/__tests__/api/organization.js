const _ = require("lodash");
const request = require("supertest");
const config = require("../../config");
const app = require("../../app");
const Wallet = require("../../models/wallet");
const Organization = require("../../models/organization");

describe('POST /api/organizations', () => {

  test('should not create a new organization with missing params', async () => {
    const response = await request(app).post("/api/organizations");
    expect(response.statusCode).toBe(400);
  });

  test('should create a new organization and wallet', async () => {
    const postBody = {name: "ACME Org", orgId: "abc123", systemOfOrigin: "system123", ownerId: "owner1"}
    const response = await request(app).post("/api/organizations").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const organization = await Organization.findOne({where: {orgId: postBody.orgId}});
    expect(organization.toJSON().orgId).toBe(postBody.orgId);

    const walletObj = await Wallet.find({where: {orgId: postBody.orgId}});
    const wallet = walletObj.toJSON();
    expect(wallet.orgId).toBe(postBody.orgId);
    expect(!_.isEmpty(wallet.publicKey));
    expect(!_.isEmpty(wallet.privateKey));
    expect(!_.isEmpty(wallet.address));
  });

  test('should return the same org if it already exists', async () => {
    const postBody = {name: "ACME Org", orgId: "abc123"}

    const response1 = await request(app).post("/api/organizations").send(postBody).set('Accept', 'application/json');
    const response2 = await request(app).post("/api/organizations").send(postBody).set('Accept', 'application/json');
    expect(_.isEqual(response1.body, response2.body));

    const wallets = await Wallet.findAll({where: {orgId: postBody.orgId}});
    expect(wallets.length).toBe(1);
  });
})

describe('GET /api/organizations', () => {

  test('should get all organizations', async () => {
    const postBody1 = {name: "NGO 1", orgId: "abc123"}
    const postBody2 = {name: "NGO 2", orgId: "xyz789"}
    await request(app).post("/api/organizations").send(postBody1).set('Accept', 'application/json');
    await request(app).post("/api/organizations").send(postBody2).set('Accept', 'application/json');
    const getResponse = await request(app).get("/api/organizations");

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.length).toBe(2);
    expect(_.includes(getResponse.body, postBody1.name));
    expect(_.includes(getResponse.body, postBody2.name));
    expect(!_.isNil(getResponse.body[0].address));
    expect(!_.isNil(getResponse.body[0].balance));
    expect(!_.isNil(getResponse.body[1].address));
    expect(!_.isNil(getResponse.body[1].balance));
  });
});

describe("GET /api/organizations/:orgId", () => {

  test('should return a 404 for a non-existing organization', async () => {
    const getResponse = await request(app).get("/api/organizations/1");
    expect(getResponse.statusCode).toBe(404);
  });

  test('should get an existing organization', async () => {
    const postBody = {name: "NGO 1", orgId: "abc123"}
    const postResponse = await request(app).post("/api/organizations").send(postBody).set('Accept', 'application/json');
    const getResponse = await request(app).get("/api/organizations/" + postResponse.body.orgId);
    expect(getResponse.body.orgId).toBe(postBody.orgId);
    expect(!_.isEmpty(getResponse.body.wallet));
    expect(!_.isNil(getResponse.body.wallet));
    expect(getResponse.body.balance).toBe(config.tokens.initialSupply);
  });
});
