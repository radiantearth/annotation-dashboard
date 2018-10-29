const Sequelize = require("sequelize");
const sequelize = require("../db");
const ACTIONS = {
  DOWNLOADED: "download",
  UPLOADED: "upload",
  VIEWED: "view",
  ANALYZED: "analyze"
}

const Event = sequelize.define("event", {
  orgId: Sequelize.STRING,
  userId: Sequelize.STRING,
  action: Sequelize.STRING,
  txHash: Sequelize.STRING,
  metadata: Sequelize.JSONB,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
});

async function createEvent(action, params) {
  const createParams = {
    orgId: params.orgId,
    userId: params.userId,
    action,
    txHash: params.txHash,
    metadata: {
      sceneId: params.sceneId,
      providerUserId: params.providerUserId,
      licensed: params.licensed
    },
    createdAt: params.createdAt,
    updatedAt: params.updatedAt
  };
  return Event.create(createParams);
}

async function createDownloadEvent(params) {
  return createEvent(ACTIONS.DOWNLOADED, params);
}

async function createUploadEvent(params) {
  return createEvent(ACTIONS.UPLOADED, params);
}

async function createViewEvent(params) {
  return createEvent(ACTIONS.VIEWED, params);
}

async function createAnalyzeEvent(params) {
  return createEvent(ACTIONS.ANALYZED, params);
}

Event.createDownloadEvent = createDownloadEvent;
Event.createUploadEvent = createUploadEvent;
Event.createViewEvent = createViewEvent;
Event.createAnalyzeEvent = createAnalyzeEvent;

module.exports = Event;
