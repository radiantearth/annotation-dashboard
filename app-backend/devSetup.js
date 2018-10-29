/**
 * This is a script for seeding the database with data such as
 * orgs and events.  Blockchain data is not seeded here as tools
 * such as `ganache-cli` reset every time they are restarted.
 *
 */
const nock = require("nock");

const Models = require("./models");
const Event = require("./models/event");
const orgService = require("./services/organization");
const eventService = require("./services/event");
const db = require("./db");
const config = require("./config");
const moment = require("moment");

const IMAGE_SCENE_ID = "fc7646fa-f6b9-42ef-9289-37fc9282260d";
const IMAGE_METADATA_DOMAIN = "https://api.radiant.earth";
const IMAGE_METADATA_DOWNLOAD_PATH = "/platform/scenes/fc7646fa-f6b9-42ef-9289-37fc9282260d";
const SUCCESS_GET_SCENE_JSON = require("./__tests__/responses/200-get-single-scene");

const NUM_ORGS = 3;
const NUM_ORG_USERS = 3;
const NUM_DAYS_EVENTS = 15;

// These provide ranges
const NUM_EVENTS_PER_USER_MIN = 1;
const NUM_EVENTS_PER_USER_MAX = 10;

function generateRandomNumberInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Given 10 events, what's the distribution we want
const EVENT_TYPE_DISTRIBUTION = ["VIEW","VIEW","VIEW","VIEW","ANALYZE","ANALYZE","ANALYZE","DOWNLOAD","DOWNLOAD","UPLOAD"];

const LICENSED_STATES = [true, false];

function generateRandomEventType() {
  return EVENT_TYPE_DISTRIBUTION[Math.trunc(generateRandomNumberInclusive(0, 9))];
}

function generateRandomLicensedState() {
  return LICENSED_STATES[Math.trunc(generateRandomNumberInclusive(0, 1))];
}

async function createViewEvent(orgId, userId, eventDate, licensed) {
  await eventService.trackUserView({userId, orgId, action: "view", sceneId: IMAGE_SCENE_ID, createdAt: eventDate, updatedAt: eventDate, licensed});
}

async function createAnalyzeEvent(orgId, userId, eventDate, licensed) {
  await eventService.trackUserAnalyze({userId, orgId, action: "analyze", sceneId: IMAGE_SCENE_ID, createdAt: eventDate, updatedAt: eventDate, licensed});
}

async function createDownloadEvent(orgId, userId, eventDate, licensed) {
  await eventService.trackUserDownload({userId, orgId, action: "download", sceneId: IMAGE_SCENE_ID, createdAt: eventDate, updatedAt: eventDate, licensed});
}

async function createUploadEvent(orgId, userId, eventDate, licensed) {
  await eventService.trackUserUpload({userId, orgId, action: "upload", sceneId: IMAGE_SCENE_ID, createdAt: eventDate, updatedAt: eventDate, licensed});
}

const EVENT_GENERATORS = {
  "VIEW": createViewEvent,
  "ANALYZE": createAnalyzeEvent,
  "DOWNLOAD": createDownloadEvent,
  "UPLOAD": createUploadEvent
}

async function createRandomEvent(orgId, userId, eventDate, licensed) {
  const eventType = generateRandomEventType();
  await EVENT_GENERATORS[eventType](orgId, userId, eventDate, licensed);
}

async function createUserEventsForADay(orgId, userId, eventDate) {
  const NUM_EVENTS_PER_USER = generateRandomNumberInclusive(NUM_EVENTS_PER_USER_MIN, NUM_EVENTS_PER_USER_MAX);
  for (let i = 0; i < NUM_EVENTS_PER_USER; i++) {
    let licensed = generateRandomLicensedState();
    await createRandomEvent(orgId, userId, eventDate, licensed);
  }
}

async function createUserEvents(orgId, userSuffix) {
  const userId = orgId + "user" + userSuffix;
  let today = moment();
  for (let i=0; i<=NUM_DAYS_EVENTS; i++) {
    await createUserEventsForADay(orgId, userId, today.subtract(1, "day"));
  }
}

async function createOrgEvents(orgId) {
  for (let i = 0; i < NUM_ORG_USERS; i++) {
    await createUserEvents(orgId, i);
  }
}

async function createOrg(suffix) {
  const params = {
    name: "Org " + suffix,
    orgId: "org" + suffix,
    verified: suffix === 0 ? false : true // we want one unverified NGO
  }

  console.log(`Creating organization ${params.orgId}...`);
  let org = await orgService.createOrganization(params);
  console.log(`Creating events for org ${params.orgId}...`);
  await createOrgEvents(params.orgId);
}

function setup() {
  console.log("nocking ", IMAGE_METADATA_DOWNLOAD_PATH);
  nock(IMAGE_METADATA_DOMAIN).get(IMAGE_METADATA_DOWNLOAD_PATH).times(5*5*5).reply(200, SUCCESS_GET_SCENE_JSON);
}

async function seed() {
  await db.drop();
  await Models.init();
  try {
    setup();
    for (let i = 0; i < NUM_ORGS; i++) {
      await createOrg(i);
    }
  } catch (err) {
    console.log("Caught err in seeding! ", err);
  }

  const totalEvents = await Event.count();
  console.log("\n\nGreat Success!\n\n");
  console.log("*****************************************************************************************************************");
  console.log(`🚀 Seeded ${NUM_ORGS} orgs with ${totalEvents} total events for ${NUM_ORG_USERS} users per org. 🚀`);
  console.log("*****************************************************************************************************************");
  db.close();
}

module.exports = seed();
