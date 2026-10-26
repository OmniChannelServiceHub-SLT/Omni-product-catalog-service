"use strict";

const express = require("express");

const { createListProductOrderBbService } = require("../services/service");

const {
  createListProductOrderBbController,
} = require("../controllers/controller");

function createListProductOrderBbRouter({
  jwtAuth,
  authorizeTelephone,
  getLegacyAuthorization,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const listProductOrderBb = createListProductOrderBbService({
    authorizeTelephone,
    getLegacyAuthorization,
  });

  const controller = createListProductOrderBbController({
    listProductOrderBb,
  });

  // Custom legacy-status endpoint.
  router.get("/bbFreedomStatus", jwtAuth, controller);

  return router;
}

module.exports = {
  createListProductOrderBbRouter,
};
