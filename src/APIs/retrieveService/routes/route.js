"use strict";
const express = require("express");
const { createRetrieveServiceService } = require("../services/service");
const { createRetrieveServiceController } = require("../controllers/controller");
function createRetrieveServiceRouter(options) {
  if (typeof options.jwtAuth !== "function") throw new TypeError("JWT middleware is required.");
  const router = express.Router();
  const retrieveService = createRetrieveServiceService(options);
  router.get("/service/:id", options.jwtAuth, createRetrieveServiceController({ retrieveService }));
  return router;
}
module.exports = { createRetrieveServiceRouter };
