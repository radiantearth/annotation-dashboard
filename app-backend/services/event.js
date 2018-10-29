const _ = require("lodash");
const moment = require("moment");
const Sequelize = require("sequelize");
const Event = require("../models/event");
const walletService = require("./wallet");
const contractsService = require("./contracts");
const RadiantAPI = require("../lib/radiantAPI");
const debug = require("debug")("re:services:event");

const config = require("../config");

async function getImageMetadata(sceneId) {
  //sample data -> owner: auth0|5a0f370f78914308349ac6dd
  return RadiantAPI.getImageData(sceneId)
}

async function trackUserDownload(params) {
  let downloadTx;
  return new Promise((resolve, reject) => {
    contractsService.getData()
     .then(data => {
       walletService.getWalletInfo(params.orgId)
        .then(wallet =>
          data.eventsMonitor.download(wallet.address, config.tokens.downloadPrice, {from: data.accounts[0], gas: config.maxBlockGas}))
        .then(_downloadTx => {
          debug("Download tx = ", _downloadTx);
          downloadTx = _downloadTx;
          return getImageMetadata(params.sceneId)
        }).then(async (imageData) => {
          // create the event in postgres
          const newEvent = await Event.createDownloadEvent(Object.assign(params, {txHash: downloadTx.tx,providerUserId: imageData.owner}));
          // TODO: call RE's logging service upon successful creation
          return resolve(newEvent);
        })
        .catch(err => reject({error: "User download event was rejected with an err = " + err}))
     })
  })
}

async function trackUserUpload(params) {
  return new Promise((resolve, reject) => {
    contractsService.getData()
     .then(data => {
       walletService.getWalletInfo(params.orgId)
        .then(wallet => data.eventsMonitor.upload(wallet.address, {from: data.accounts[0]}))
        .then(async (uploadTx) => {
          debug("Upload tx = ", uploadTx);
          // create the event in postgres
          const newEvent = await Event.createUploadEvent(Object.assign(params, {txHash: uploadTx.tx}));
          // TODO: call RE's logging service upon successful creation
          return resolve(newEvent);
        })
        .catch(err => reject({error: "User upload event was rejected with an err = " + err}))
     })
  })
}

async function trackUserView(params) {
  return new Promise((resolve, reject) => {
    contractsService.getData()
     .then(data => {
       walletService.getWalletInfo(params.orgId)
        .then(wallet => data.eventsMonitor.viewImage(wallet.address, {from: data.accounts[0]}))
        .then(async (viewTx) => {
          debug("View tx = ", viewTx);
          // create the event in postgres
          const newEvent = await Event.createViewEvent(Object.assign(params, {txHash: viewTx.tx}));
          // TODO: call RE's logging service upon successful creation
          return resolve(newEvent);
        })
        .catch(err => reject({error: "User view event was rejected with an err = " + err}))
     })
  })
}

async function trackUserAnalyze(params) {
  return new Promise((resolve, reject) => {
    contractsService.getData()
     .then(data => {
       walletService.getWalletInfo(params.orgId)
        .then(wallet =>
          data.eventsMonitor.analyze(wallet.address, config.tokens.analyzePrice, {from: data.accounts[0], gas: config.maxBlockGas}))
        .then(async (analyzeTx) => {
          debug("Analyze tx = ", analyzeTx);
          // create the event in postgres
          const newEvent = await Event.createAnalyzeEvent(Object.assign(params, {txHash: analyzeTx.tx}));
          // TODO: call RE's logging service upon successful creation
          return resolve(newEvent);
        })
        .catch(err => reject({error: "User analyze event was rejected with an err = " + err}))
     })
  })
}

// Helper to set the pagination parameters
function getPaginationParameters(params) {
  let offset = params.offset || 0;
  let limit = params.limit || config.QUERY_LIMIT;
  return {offset, limit}
}

// Helper to get the query's timeframe
// params.timePeriod can be `month`, `week`, `day`.  default is `week`
function getQueryStartDate(params) {
  let numDaysBack = 7; // default one week back
  if (params.timePeriod === "month") {
    numDaysBack = 30;
  } else if (params.timePeriod === "day") {
    numDaysBack = 1;
  }
  return moment().subtract(numDaysBack, "days");
}

// Builds the `where` clause of the query
function getQueryWhere(baseQuery, params) {
  let resQuery = baseQuery;
  if (params.licensed != undefined) {
    resQuery = Object.assign(resQuery, {metadata: {'$contains': { licensed: JSON.parse(params.licensed)}}})
  }

  if (params.eventType != undefined) {
    resQuery = Object.assign(resQuery, {action: params.eventType});
  }
  return resQuery;
}

// Get all the events for one user
async function getEventsForUserId(userId, params = {}) {
  const {offset, limit} = getPaginationParameters(params);
  const where = getQueryWhere({userId}, params);
  return new Promise(resolve => {
    return Event.findAll({
      where,
      order:[["createdAt", "DESC"]],
      offset,
      limit
    }).then(resolve)
  });
}

async function getCounts(where, params = {}) {
  const startDate = getQueryStartDate(params);
  where = Object.assign(where, {createdAt: {$gte: startDate}});
  if (!_.isEmpty(params.eventType)) {
    where = Object.assign(where, {action: params.eventType});
  }
  const attributes = ['createdAt', 'userId'];
  const order = [['createdAt', 'ASC']];
  return Event.findAll({
    raw: true,
    where,
    attributes,
    order
  });
}

// Used for the charts, group counts by day
async function getCountByDay(where, params = {}) {
  return getCounts(where, params).then(events => {
    const result = _.chain(events).groupBy(event => {
      return moment(event.createdAt).startOf("day");
    }).map(function(res, key) {
      return {date: key, count: res.length};
    })
    return result;
  });
}

// Used for the charts, group counts by user
async function getCountByUser(where, params = {}) {
  return getCounts(where, params).then(events => {
    const result = _.chain(events).groupBy(event => {
      return event.userId;
    }).map(function(res, key) {
      return {userId: key, count: res.length};
    })
    return result;
  });
}

// Get a count of events for a user for a given time
async function getEventsCountForUserId(userId, params) {
  const where = getQueryWhere({userId}, params);
  return getCountByDay(where, params);
}

// Get all the events for an organization
async function getEventsForOrgId(orgId, params = {}) {
  const {offset, limit} = getPaginationParameters(params);
  const where = getQueryWhere({orgId}, params);
  return new Promise((resolve) => {
    return Event.findAll({
      where,
      order:[["createdAt", "DESC"]],
      offset,
      limit
    }).then(resolve)
  });
}

// Get a count of events for an org for a period of time
async function getEventsCountForOrgId(orgId, params = {}) {
  const where = getQueryWhere({orgId}, params);
  return getCountByDay(where, params);
}

async function getEventsCountTotalForOrgId(orgId) {
  const where = getQueryWhere({orgId}, {});
  return new Promise((resolve) => {
    return Event.count({
      raw: true,
      where
    }).then(resolve)
  });
}

// Get a count of events by user for an org for a period of time
async function getEventsCountByUserForOrgId(orgId, params = {}) {
  const where = getQueryWhere({orgId}, params);
  return getCountByUser(where, params);
}

// Get a count of events across all orgs for a period of time
async function getEventsCountForOrgs(params = {}) {
  const where = getQueryWhere({}, params);
  return getCountByDay(where, params);
}

async function getEventsUsersCountTotal() {
  return new Promise((resolve) => {
    return Event.aggregate('userId', 'DISTINCT', { plain: false }).then(res => resolve(res.length))
  });
}

module.exports = {
  trackUserDownload,
  trackUserUpload,
  trackUserView,
  trackUserAnalyze,
  getEventsForUserId,
  getEventsCountForUserId,
  getEventsForOrgId,
  getEventsCountForOrgId,
  getEventsCountForOrgs,
  getEventsCountByUserForOrgId,
  getEventsCountTotalForOrgId,
  getEventsUsersCountTotal
}
