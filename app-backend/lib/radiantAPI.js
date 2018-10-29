const request = require("request-promise-native");
const debug = require("debug")("re:lib:radiant");
const config = require("../config");
const DEFAULT_SCENE_JSON = require("./default-scene");

const RADIANT_API = config.radiantEarthAPI.url;
const BEARER_TOKEN = config.radiantEarthAPI.authorization;

function getRequestHeaders() {
  return {
    "Accept": "application/json",
    "Authorization": BEARER_TOKEN
  }
}

async function getImageData(sceneId) {
  const IMAGE_URL = RADIANT_API + "/platform/scenes/" + sceneId
  debug("Querying image URL " + IMAGE_URL);
  const reqParams = {
    uri: IMAGE_URL,
    headers: getRequestHeaders()
  }

  return new Promise((resolve, reject) => {
    return request(reqParams).then(response => {
      return resolve(JSON.parse(response));
    }).catch(err => {
      return resolve(DEFAULT_SCENE_JSON);
    });
  })

}

module.exports = {
  getImageData
}