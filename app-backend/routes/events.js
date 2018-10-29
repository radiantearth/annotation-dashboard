const _ = require("lodash");
const express = require("express");
const router = express.Router();
const eventService = require("../services/event");

/**
 * @swagger
 * definition:
 *   events:
 *     properties:
 *       orgId:
 *         type: string
 *       userId:
 *         type: string
 *       action:
 *         type: string
 *       txHash:
 *         type: string
 *       metadata:
 *         type: object
 *       createAt:
 *         type: string
 *       updateAt:
 *         type: string
 *     example:
 *       orgId: org0
 *       userId: org0user1
 *       action: download
 *       txHash: 0x726bb862bcfde0061fc5fc60401c704b8e4117a0a6dcc18c3eb6fc68b4dd4e50
 *       metadata: {sceneId: scene123, providerUserId: auth0|5a0f370f78914308349ac6dd}
 *       createdAt: 2018-08-31T17:59:06.491Z
 *       updatedAt: 2018-08-31T17:59:06.491Z
 */


/**
 * @swagger
 * /api/events/users/{userId}:
 *   post:
 *     summary: Submit a new event for a user.
 *     description: This creates the event on the blockchain and a corresponding event in the database, with a reference to the blockchain event. If the blockchain event creation fails, the db event will not be created.
 *     tags:
 *       - events
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The new event
 *         schema:
 *           $ref: '#/definitions/events'
 *       400:
 *          description: Action or orgId or sceneId parameters are missing.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The user's id on Radiant Earth.
 *       - in: body
 *         name: event
 *         description: Basic event information.
 *         schema:
 *            type: object
 *            properties:
 *              action:
 *                type: string
 *                enum: [download, view, upload, analyze]
 *                description: The action the user took.
 *              orgId:
 *                type: string
 *                description: The id of the organzation to which the user belongs.
 *              sceneId:
 *                type: string
 *                description: The id of the scene associated with this event.
 *              licensed:
 *                type: boolean
 *                description: Boolean indicating if this content is licensed or not.
 *            required:
 *              - action
 *              - orgId
 *              - sceneId
 *            example:
 *              action: download
 *              orgId: abc123
 *              sceneId: scene123
 *              licensed: true
 */
router.post("/api/events/users/:id", function(req, res) {
  let {action, orgId, sceneId, licensed} = req.body;
  if (_.isEmpty(action) || _.isEmpty(orgId) || _.isEmpty(sceneId)) {
    return res.json(400, "Action and orgId and sceneId are required parameters.");
  }
  switch (action) {
    case "upload":
      eventService.trackUserUpload({userId: req.params.id, orgId, action, sceneId, licensed}).then(event => res.json(event))
       .catch(error => res.json(500, error));
       break;
    case "download":
      eventService.trackUserDownload({userId: req.params.id, orgId, action, sceneId, licensed}).then(event => res.json(event))
       .catch(error => res.json(500, error));
      break;
    case "view":
      eventService.trackUserView({userId: req.params.id, orgId, action, sceneId, licensed}).then(event => res.json(event))
       .catch(error => res.json(500, error));
      break;
    case "analyze":
      eventService.trackUserAnalyze({userId: req.params.id, orgId, action, sceneId, licensed}).then(event => res.json(event))
       .catch(error => res.json(500, error));
      break;
    default: res.json(500, "Required action is not supported");
  }
});

/**
 * @swagger
 * /api/events/users/{userId}:
 *    get:
 *     summary: Get events for a user.
 *     description: The events are sorted in a descending time order, with the most recent events first.
 *     tags:
 *       - events
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of events
 *         schema:
 *           $ref: '#/definitions/events'
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The user's id on Radiant Earth.
 *       - in: query
 *         name: limit
 *         required: false
 *         type: integer
 *         description: The number of items to return; defaults to 50.
 *       - in: query
 *         name: offset
 *         required: false
 *         type: integer
 *         description: The offset from which to being retrieving the results.
 */
router.get("/api/events/users/:id", function(req, res) {
  eventService.getEventsForUserId(req.params.id, req.query).then(events => {
    res.json({events});
  }).catch(error => {
    res.json(500, error);
  });
});


/**
 * @swagger
 * /api/events/users/{userId}/count:
 *    get:
 *     summary: Get a count of events for a user.
 *     description: This query is time bound.
 *     tags:
 *       - events
 *     produces:
 *         - array
 *     responses:
 *       200:
 *         description: An array of objects containing a UTC date and a count.
 *         example:
 *           date: "2018-09-01"
 *           count: 123
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *         description: The user's id on Radiant Earth.
 *       - in: query
 *         name: timePeriod
 *         required: false
 *         type: string
 *         enum: [week, day, month]
 *         description: The window of time to query for. Defaults to week.
 */
router.get("/api/events/users/:id/count", function(req, res) {
  eventService.getEventsCountForUserId(req.params.id, req.query).then(count => {
    res.json(count);
  }).catch(error => {
    res.json(500, error.message);
  });
});

/**
 * @swagger
 * /api/events/organizations/count:
 *    get:
 *     summary: Get a count of events across all organizations.
 *     description: This query is time bound.
 *     tags:
 *       - events
 *     produces:
 *         - array
 *     responses:
 *       200:
 *         description: An array of objects containing a UTC date and a count.
 *         example:
 *           date: "2018-09-01"
 *           count: 123
 *     parameters:
 *       - in: query
 *         name: timePeriod
 *         required: false
 *         type: string
 *         enum: [week, day, month]
 *         description: The window of time to query for. Defaults to week.
 */
router.get("/api/events/organizations/count", function(req, res) {
  eventService.getEventsCountForOrgs(req.query).then(count => {
    res.json(count);
  }).catch(error => {
    res.json(500, error);
  });
});

/**
 * @swagger
 * /api/events/organizations/{orgId}:
 *    get:
 *     summary: Get events for an organization.
 *     description: The events are sorted in a descending time order, with the most recent events first.
 *     tags:
 *       - events
 *     produces:
 *       - array
 *     responses:
 *       200:
 *         description: An array of events.
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         type: string
 *         description: The organization's id on Radiant Earth.
 *       - in: query
 *         name: limit
 *         required: false
 *         type: integer
 *         description: The number of items to return; defaults to 50.
 *       - in: query
 *         name: offset
 *         required: false
 *         type: integer
 *         description: The offset from which to being retrieving the results.
 *       - in: query
 *         name: eventType
 *         required: false
 *         type: string
 *         enum: [download, view, upload, analyze]
 *         description: The action the user took.
 */
router.get("/api/events/organizations/:id", function(req, res) {
  eventService.getEventsForOrgId(req.params.id, req.query).then(events => {
    res.json({events});
  }).catch(error => {
    res.json(500, error);
  });
});

/**
 * @swagger
 * /api/events/organizations/{orgId}/count:
 *    get:
 *     summary: Get a count of events for an organization, grouped by date or user.
 *     description: This query is time bound
 *     tags:
 *       - events
 *     produces:
 *       - array
 *     responses:
 *       200:
 *         description: An array of objects containing a UTC date and a count.
 *         example:
 *           date: "2018-09-01"
 *           count: 123
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         type: string
 *         description: the organization's id on Radiant Earth
 *       - in: query
 *         name: timePeriod
 *         required: false
 *         type: string
 *         enum: [week, day, month]
 *         description: The window of time to query for. Defaults to week.
 *       - in: query
 *         name: eventType
 *         required: false
 *         type: string
 *         enum: [download, view, upload, analyze]
 *         description: The action the user took.
 *       - in: query
 *         name: groupBy
 *         required: false
 *         type: string
 *         enum: [date, user]
 *         description: Group the results by the date or the user. Defaults to grouping by date.
 */
router.get("/api/events/organizations/:id/count", function(req, res) {
  let getCountFunction = req.query.groupBy === "user" ? eventService.getEventsCountByUserForOrgId : eventService.getEventsCountForOrgId;
  getCountFunction(req.params.id, req.query).then(count => {
    res.json(count);
  }).catch(error => {
    res.json(500, error);
  });
});

/**
 * @swagger
 * /api/events/organizations/{orgId}/totalCount:
 *    get:
 *     summary: Get a total count of events for an organization.
 *     tags:
 *       - events
 *     produces:
 *       - integer
 *     responses:
 *       200:
 *         description: Total count of events per organization
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         type: string
 *         description: the organization's id on Radiant Earth
 */
router.get("/api/events/organizations/:id/totalCount", function(req, res) {
  eventService.getEventsCountTotalForOrgId(req.params.id).then(count => {
    res.json(count);
  }).catch(error => {
    res.json(500, error);
  });
});

/**
 * @swagger
 * /api/users/totalCount:
 *    get:
 *     summary: Get a total count of users for all organizations.
 *     produces:
 *       - integer
 *     responses:
 *       200:
 *         description: Total count of users for all organizations.
 */
router.get("/api/users/totalCount", function(req, res) {
  eventService.getEventsUsersCountTotal().then(count => {
    res.json(count);
  }).catch(error => {
    res.json(500, error);
  });
});


module.exports = router;
