const config = require("../config");
const BASE_SERVER_URL = config.FALCON_API_URL;

async function getOrganization(orgId) {
  const orgAPIURL = BASE_SERVER_URL + "api/organizations/";
  return fetch(orgAPIURL + orgId).then(result => {
    return result.json();
  });
}

async function getOrganizations(query) {
  let orgsAPIURL = BASE_SERVER_URL + "api/organizations";
  return fetch(orgsAPIURL).then(result => {
    return result.json();
  });
}

async function getEventsForOrganization(orgId, offset) {
  const params = {offset};
  const eventAPIURL = new URL(BASE_SERVER_URL + `api/events/organizations/` + orgId)
  eventAPIURL.search = new URLSearchParams(params)

  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getEventsCountForAllOrganizations(eventType, timePeriod, licensed) {
  const params = {eventType, timePeriod, licensed};
  const eventAPIURL = new URL(BASE_SERVER_URL + `api/events/organizations/count`)
  eventAPIURL.search = new URLSearchParams(params)

  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getEventsCountForOrganization(orgId, eventType, timePeriod, licensed) {
  const params = {eventType, timePeriod, licensed};
  const eventAPIURL = new URL(BASE_SERVER_URL + `api/events/organizations/${orgId}/count`)
  eventAPIURL.search = new URLSearchParams(params)

  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getEventsCountForOrganizationUsers(orgId, groupBy, timePeriod, licensed) {
  const params = {groupBy, timePeriod, licensed};
  const eventAPIURL = new URL(BASE_SERVER_URL + `api/events/organizations/${orgId}/count`)
  eventAPIURL.search = new URLSearchParams(params)

  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getEventsForUser(userId) {
  const eventAPIURL = BASE_SERVER_URL + "api/events/users/";
  return fetch(eventAPIURL + userId).then(result => {
    return result.json();
  });
}

async function getEventsCountForUser(userId) {
  const eventAPIURL = BASE_SERVER_URL + `api/events/users/${userId}/count`;
  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getOrgEventCount(orgId) {
  const eventAPIURL = BASE_SERVER_URL + `api/events/organizations/${orgId}/totalCount`;
  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

async function getEventUsersTotalCount(query) {
  const eventAPIURL = BASE_SERVER_URL + `api/users/totalCount`;
  return fetch(eventAPIURL).then(result => {
    return result.json();
  });
}

const API = {
  getOrganization,
  getOrganizations,
  getEventsForOrganization,
  getEventsCountForAllOrganizations,
  getEventsCountForOrganization,
  getEventsCountForOrganizationUsers,
  getEventsForUser,
  getEventsCountForUser,
  getOrgEventCount,
  getEventUsersTotalCount
}
export default API
