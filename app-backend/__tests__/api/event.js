const _ = require("lodash");
const request = require("supertest");
const nock = require("nock");
const timekeeper = require("timekeeper");
const moment = require("moment");
const app = require("../../app");
const Event = require("../../models/event");
const tokenService = require("../../services/tokens");
const walletService = require("../../services/wallet");
const config = require("../../config");

const SUCCESS_GET_SCENE_JSON = require("../responses/200-get-single-scene");
const IMAGE_PROVIDER_USER_ID = "auth0|5a0f370f78914308349ac6dd";
const IMAGE_METADATA_DOMAIN = "https://api.radiant.earth";
const IMAGE_METADATA_DOWNLOAD_BASE_PATH = "/platform/scenes/";
//fc7646fa-f6b9-42ef-9289-37fc9282260d
beforeEach(async () => {
  const postBody = {name: "ACME Org", orgId: "abc123"}
  const response = await request(app).post("/api/organizations").send(postBody).set('Accept', 'application/json');
  expect(response.statusCode).toBe(200);
});

beforeEach(() => {
  nock(IMAGE_METADATA_DOMAIN).get(IMAGE_METADATA_DOWNLOAD_BASE_PATH + "scene123").times(1).reply(200, SUCCESS_GET_SCENE_JSON);
  nock(IMAGE_METADATA_DOMAIN).get(IMAGE_METADATA_DOWNLOAD_BASE_PATH + "scene124").times(1).reply(200, SUCCESS_GET_SCENE_JSON);
  nock(IMAGE_METADATA_DOMAIN).get(IMAGE_METADATA_DOWNLOAD_BASE_PATH + "scene125").times(1).reply(200, SUCCESS_GET_SCENE_JSON);
})

describe('POST /api/events/users', () => {

  test('should not create a new event with missing params', async () => {
    const response = await request(app).post("/api/events/users/:user123");
    expect(response.statusCode).toBe(400);
  });

  test('should create a new event', async () => {
    const postBody = {action: "download", orgId: "abc123", sceneId: "scene123"}
    const response = await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const event = await Event.findOne({where: {userId: "user123"}});
    expect(event.action).toBe(postBody.action);
    expect(event.orgId).toBe(postBody.orgId);
    expect(event.userId).toBe("user123");
    expect(event.metadata.sceneId).toBe(postBody.sceneId);
    expect(event.metadata.providerUserId).toBe(IMAGE_PROVIDER_USER_ID);
    expect(event.txHash).toBeDefined();
  });
});

describe('GET /api/events/users', () => {

  test('should get all of a users events', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123"}
    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    const postBody2 = {action: "download", orgId: "abc123", sceneId: "scene124"}
    await request(app).post("/api/events/users/user123").send(postBody2).set('Accept', 'application/json');
    const postBody3 = {action: "upload", orgId: "abc123", sceneId: "scene125"}
    await request(app).post("/api/events/users/user123").send(postBody3).set('Accept', 'application/json');
    const postBody4 = {action: "analyze", orgId: "abc123", sceneId: "scene125"}
    await request(app).post("/api/events/users/user123").send(postBody4).set('Accept', 'application/json');

    const getResponse = await request(app).get("/api/events/users/user123");
    const events = getResponse.body.events;
    expect(events.length).toBe(4);
    expect(events[0].action).toBe(postBody4.action);
    expect(events[0].metadata.sceneId).toBe(postBody4.sceneId);
    expect(events[1].action).toBe(postBody3.action);
    expect(events[1].metadata.sceneId).toBe(postBody3.sceneId);
    expect(events[2].action).toBe(postBody2.action);
    expect(events[2].metadata.sceneId).toBe(postBody2.sceneId);
    expect(events[2].metadata.providerUserId).toBe(IMAGE_PROVIDER_USER_ID);
    expect(events[3].action).toBe(postBody1.action);
    expect(events[3].metadata.sceneId).toBe(postBody1.sceneId);
    expect(events[3].metadata.providerUserId).toBe(IMAGE_PROVIDER_USER_ID);
  });

  test('should get a count of all a users events for the past month', async () => {
    const postBody = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const now = moment(new Date());

    timekeeper.freeze(now.toDate());
    // Three events today
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');

    // Five events last week
    timekeeper.freeze(moment(now).subtract(1, "week").toDate());
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');

    // Two events two weeks ago
    timekeeper.freeze(moment(now).subtract(2, "weeks").toDate());
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');

    timekeeper.reset();

    const response = await request(app).get("/api/events/users/user123/count?timePeriod=month");
    expect(response.body.length).toBe(3);
    expect(response.body[0].count).toBe(2);
    expect(response.body[0].date).toBe(now.startOf("day").subtract(2, "weeks").toString());
    expect(response.body[1].count).toBe(5);
    expect(response.body[1].date).toBe(now.startOf("day").add(1, "weeks").toString());
    expect(response.body[2].count).toBe(3);
    expect(response.body[2].date).toBe(now.startOf("day").add(1, "weeks").toString());
  });
});

describe('GET /api/events/organizations', () => {

  test('should get all of an organizations events', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123"}
    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    const postBody2 = {action: "download", orgId: "abc123", sceneId: "scene124"}
    await request(app).post("/api/events/users/user124").send(postBody2).set('Accept', 'application/json');
    const postBody3 = {action: "upload", orgId: "abc123", sceneId: "scene125"}
    await request(app).post("/api/events/users/user123").send(postBody3).set('Accept', 'application/json');

    const getResponse = await request(app).get("/api/events/organizations/abc123");
    const events = getResponse.body.events;
    expect(events.length).toBe(3);
    expect(events[0].metadata.sceneId).toBe(postBody3.sceneId);
    expect(events[1].metadata.sceneId).toBe(postBody2.sceneId);
    expect(events[2].metadata.sceneId).toBe(postBody1.sceneId);
  });

  test('should get a count of all an organizations events for the past week', async () => {
    const postBodyUser123 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBodyUser124 = {action: "download", orgId: "abc123", sceneId: "scene124"};
    const postBodyUser125 = {action: "upload", orgId: "abc123", sceneId: "scene125"};

    const now = moment(new Date());

    timekeeper.freeze(now.toDate());

    // Three events today
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    // Five events four days ago
    timekeeper.freeze(moment(now).subtract(4, "days").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    // Two events two weeks ago
    timekeeper.freeze(moment(now).subtract(2, "weeks").toDate());
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    timekeeper.reset();

    const response = await request(app).get("/api/events/organizations/abc123/count?timePeriod=week");
    expect(response.body.length).toBe(2);
    expect(response.body[0].count).toBe(5);
    expect(response.body[1].count).toBe(3);
  });

  test('should get a count of a specific event for the past week', async () => {
    const postBodyUser123 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBodyUser124 = {action: "download", orgId: "abc123", sceneId: "scene124"};
    const postBodyUser125 = {action: "upload", orgId: "abc123", sceneId: "scene125"};

    const now = moment(new Date());

    timekeeper.freeze(now.toDate());

    // Three events today
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    // Five events four days ago
    timekeeper.freeze(moment(now).subtract(4, "days").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBodyUser123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBodyUser124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    // Two events two weeks ago
    timekeeper.freeze(moment(now).subtract(2, "weeks").toDate());
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBodyUser125).set('Accept', 'application/json');

    timekeeper.reset();

    const response = await request(app).get("/api/events/organizations/abc123/count?timePeriod=week&eventType=download");
    expect(response.body.length).toBe(2);
    expect(response.body[0].count).toBe(4);
    expect(response.body[1].count).toBe(2);
  });

  test('should get a total count of events for a specific organization', async () => {
    const postOrg1User123 = {action: "view", orgId: "abc123", sceneId: "scene123"};
    const postOrg1User124 = {action: "view", orgId: "abc123", sceneId: "scene124"};
    const postOrg1User125 = {action: "view", orgId: "abc123", sceneId: "scene125"};

    // Three events for organization abc123
    await request(app).post("/api/events/users/user1").send(postOrg1User123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user1").send(postOrg1User124).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user1").send(postOrg1User125).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/organizations/abc123/totalCount");
    expect(response.text).toBe("3");
  });
});

describe('Test tokens deductions when download, analyze, view or upload events are submitted', () => {

  test('should deduct tokens from balance when download', async () => {
    const orgId = "abc123";
    const wallet = await walletService.getWalletInfo(orgId)
    const balanceBefore = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.initialSupply);

    const postBody = {action: "download", orgId: orgId, sceneId: "scene123"}
    const response = await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const balanceAfter = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.downloadPrice + balanceAfter.toNumber());
  });

  test('should deduct tokens from balance when analyze', async () => {
    const orgId = "abc123";
    const wallet = await walletService.getWalletInfo(orgId)
    const balanceBefore = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.initialSupply);

    const postBody = {action: "analyze", orgId: orgId, sceneId: "scene123"}
    const response = await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const balanceAfter = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.analyzePrice + balanceAfter.toNumber());
  });

  test('should not deduct tokens from balance when upload', async () => {
    const orgId = "abc123";
    const wallet = await walletService.getWalletInfo(orgId)
    const balanceBefore = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.initialSupply);

    const postBody = {action: "upload", orgId: orgId, sceneId: "scene123"}
    const response = await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const balanceAfter = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(balanceAfter.toNumber());
  });

  test('should not deduct tokens from balance when view', async () => {
    const orgId = "abc123";
    const wallet = await walletService.getWalletInfo(orgId)
    const balanceBefore = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(config.tokens.initialSupply);

    const postBody = {action: "view", orgId: orgId, sceneId: "scene123"}
    const response = await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);

    const balanceAfter = await tokenService.balance(wallet.address);
    expect(balanceBefore.toNumber()).toBe(balanceAfter.toNumber());
  });

});

describe('Image License', () => {

  test('should return image licenses information', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123", licensed: true}
    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    const postBody2 = {action: "download", orgId: "abc123", sceneId: "scene123", licensed: false}
    await request(app).post("/api/events/users/user123").send(postBody2).set('Accept', 'application/json');
    const postBody3 = {action: "upload", orgId: "abc123", sceneId: "scene123", licensed: true}
    await request(app).post("/api/events/users/user123").send(postBody3).set('Accept', 'application/json');

    const getResponse = await request(app).get("/api/events/organizations/abc123");
    const events = getResponse.body.events;
    expect(events.length).toBe(3);
    expect(events[0].metadata.licensed).toBe(postBody3.licensed);
    expect(events[1].metadata.licensed).toBe(postBody2.licensed);
    expect(events[2].metadata.licensed).toBe(postBody1.licensed);
  });
});

describe("Org Event Pagination", async () => {

  test('should support a passed in limit', async () => {
    const postBody = {action: "download", orgId: "abc123", sceneId: "scene123"};

    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBody).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/organizations/abc123?limit=4");
    expect(response.body.events.length).toBe(4);
  });

  test('should support a passed in offset', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123", licensed: true};
    const postBody2 = {action: "download", orgId: "abc123", sceneId: "scene124", licensed: false};
    const postBody3 = {action: "upload", orgId: "abc123", sceneId: "scene125", licensed: true};

    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user124").send(postBody2).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user125").send(postBody3).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/organizations/abc123?offset=2");
    expect(response.body.events.length).toBe(1);
    expect(response.body.events[0].metadata.sceneId).toBe(postBody1.sceneId);
  });
});

describe("User Event Pagination", async () => {

  test('should support a passed in limit', async () => {
    const postBody = {action: "download", orgId: "abc123", sceneId: "scene123"};

    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/users/user123?limit=4");
    expect(response.body.events.length).toBe(4);
  });

  test('should support a passed in offset', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123", licensed: true};
    const postBody2 = {action: "download", orgId: "abc123", sceneId: "scene124", licensed: true};
    const postBody3 = {action: "download", orgId: "abc123", sceneId: "scene125", licensed: true};

    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody2).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody3).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/users/user123?offset=2");
    expect(response.body.events.length).toBe(1);
    expect(response.body.events[0].metadata.sceneId).toBe(postBody1.sceneId);
  });

});

describe("Event Filtering", async () => {

  test('should query user events by action type', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBody2 = {action: "upload", orgId: "abc123", sceneId: "scene123"};

    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody2).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/users/user123?eventType=download");

    expect(response.body.events.length).toBe(1);
    expect(response.body.events[0].action).toBe("download");
  });

  test('should query organization events by action type', async () => {
    const postBody1 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBody2 = {action: "upload", orgId: "abc123", sceneId: "scene123"};

    await request(app).post("/api/events/users/user123").send(postBody1).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBody2).set('Accept', 'application/json');

    const response = await request(app).get("/api/events/organizations/abc123?eventType=download");

    expect(response.body.events.length).toBe(1);
    expect(response.body.events[0].action).toBe("download");
  });
});

describe("Overall Org Activity", async () => {

  test('should get a count of all orgs download events for the past week', async () => {
    const postBody456 = {name: "ACME Org 456", orgId: "abc456"}
    await request(app).post("/api/organizations").send(postBody456).set('Accept', 'application/json');
    const postBody789 = {name: "ACME Org 789", orgId: "abc789"}
    await request(app).post("/api/organizations").send(postBody789).set('Accept', 'application/json');

    const postBodyOrg123 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBodyOrg456 = {action: "download", orgId: "abc456", sceneId: "scene124"};
    const postBodyOrg789 = {action: "upload", orgId: "abc789", sceneId: "scene125"};

    const now = moment(new Date());

    timekeeper.freeze(now.toDate());

    // Three events today
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    // Five events four days ago
    timekeeper.freeze(moment(now).subtract(4, "days").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    // Two events two weeks ago
    timekeeper.freeze(moment(now).subtract(2, "weeks").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    timekeeper.reset();

    const response = await request(app).get("/api/events/organizations/count?timePeriod=week&eventType=download");

    expect(response.body.length).toBe(2);
    expect(response.body[0].count).toBe(5);
    expect(response.body[1].count).toBe(2);
  });
})

describe("Org Activity Count By User", async () => {

  test('should group download event count by user for the past week', async () => {
    const postBodyOrg123 = {action: "download", orgId: "abc123", sceneId: "scene123"};
    const postBodyOrg456 = {action: "download", orgId: "abc123", sceneId: "scene124"};
    const postBodyOrg789 = {action: "upload", orgId: "abc123", sceneId: "scene125"};

    const now = moment(new Date());

    timekeeper.freeze(now.toDate());

    // Three events today
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    // Five events four days ago
    timekeeper.freeze(moment(now).subtract(4, "days").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    // Two events two weeks ago
    timekeeper.freeze(moment(now).subtract(2, "weeks").toDate());
    await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
    await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    timekeeper.reset();

    const response = await request(app).get("/api/events/organizations/abc123/count?timePeriod=week&eventType=download&groupBy=user");

    expect(response.body.length).toBe(2);
    expect(response.body[0].count).toBe(3);
    expect(response.body[1].count).toBe(4);
  });
})

describe("Users counts", async () => {

  test('should return total count of users for all orgs', async () => {
     const postBodyOrg123 = {action: "view", orgId: "abc123", sceneId: "scene123"};
     const postBodyOrg456 = {action: "view", orgId: "abc123", sceneId: "scene124"};
     const postBodyOrg789 = {action: "view", orgId: "abc123", sceneId: "scene125"};

     await request(app).post("/api/events/users/user123").send(postBodyOrg123).set('Accept', 'application/json');
     await request(app).post("/api/events/users/user456").send(postBodyOrg456).set('Accept', 'application/json');
     await request(app).post("/api/events/users/user789").send(postBodyOrg789).set('Accept', 'application/json');

    const response = await request(app).get("/api/users/totalCount");

    expect(response.body).toBe(3);
  });
})
