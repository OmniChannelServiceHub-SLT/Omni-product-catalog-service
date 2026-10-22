"use strict";

const express = require("express");

const { createRetrieveServiceService } = require("../services/service");

const {
  createRetrieveServiceController,
} = require("../controllers/controller");

function createRetrieveServiceRouter({
  ServiceModel,
  jwtAuth,
  authorizeService,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const retrieveService = createRetrieveServiceService({
    ServiceModel,
    authorizeService,
    publicBaseUrl,
  });

  const controller = createRetrieveServiceController({
    retrieveService,
  });

  router.get("/service/:id", jwtAuth, controller);

  return router;
}

module.exports = { createRetrieveServiceRouter };
