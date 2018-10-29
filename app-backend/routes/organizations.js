const _ = require("lodash");
const express = require("express");
const router = express.Router();
const orgService = require("../services/organization");

/**
 * @swagger
 * definition:
 *   organizations:
 *     properties:
 *       orgId:
 *         type: string
 *       name:
 *         type: string
 *       systemOfOrigin:
 *         type: string
 *       ownerId:
 *         type: string
 *       verified:
 *         type: boolean
 *       createAt:
 *         type: string
 *       updateAt:
 *         type: string
 *     example:
 *       orgId: org0
 *       name: ACME Org
 *       systemOfOrigin: system123
 *       ownerId: owner1
 *       verified: true
 *       createdAt: 2018-08-31T17:59:06.491Z
 *       updatedAt: 2018-08-31T17:59:06.491Z
 */


/**
 * A home landing page
 */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Blockchain" });
});

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create a new organization.
 *     description: This adds a new organization to the database, creates a wallet for the organization, and seeds the wallet with tokens.  See config/index.js for the initial token supply.
 *     tags:
 *       - organizations
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The new organization
 *         schema:
 *           $ref: '#/definitions/organizations'
 *       400:
 *          description: Name or orgId parameters are missing.
 *     parameters:
 *       - in: body
 *         name: organization
 *         description: Basic organization information.
 *         schema:
 *            type: object
 *            properties:
 *              orgId:
 *                type: string
 *                description: The id of the organzation.
 *              name:
 *                type: string
 *                description: The name of the organization.
 *              systemOfOrigin:
 *                type: string
 *                description: A Radiant Earth attribute. Indiciates where the organization was created on Radiant Earth.
 *              ownerId:
 *                type: string
 *                description: A Radiant Earth attribute. The owner of this organization.
 *            required:
 *              - name
 *              - orgId
 *            example:
 *              orgId: org1
 *              name: ACME Org
 *              systemOfOrigin: system123
 *              ownerId: owner1
 *              verified: false
 */
router.post("/api/organizations", function(req, res, next) {
  let {name, orgId, systemOfOrigin, ownerId, verified} = req.body;
  if (_.isEmpty(name) || _.isEmpty(orgId)) {
    return res.json(400, "Name and orgId are required parameters.");
  }
  orgService.createOrganization({name, orgId, systemOfOrigin, ownerId, verified}).then(org => {
    res.json(org);
  })
  .catch(error => {
    res.json(500, error);
  });
});


/**
 * @swagger
 * /api/organizations:
 *    get:
 *     summary: Get all organizations
 *     tags:
 *       - organizations
 *     produces:
 *       - array
 *     responses:
 *       200:
 *         description: An array of all organizations
 */
router.get("/api/organizations", function(req, res, next) {
  orgService.getOrganizations().then(orgs => {
    res.json(orgs);
  }).catch(error => {
    res.json(500, error);
  });
});

/**
 * @swagger
 * /api/organizations/{orgId}:
 *    get:
 *     summary: Get an individual organization
 *     tags:
 *       - organizations
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A single organization
 *         schema:
 *            $ref: '#/definitions/organizations'
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         type: string
 *         description: The organization's id on Radiant Earth.
 */
router.get("/api/organizations/:orgId", function(req, res, next) {
  orgService.getOrganization(req.params.orgId).then(org => {
    if (_.isEmpty(org)) {
      res.sendStatus(404);
    } else {
      res.json(org);
    }
  }).catch(error => {
    res.json(500, error);
  });
});

module.exports = router;
