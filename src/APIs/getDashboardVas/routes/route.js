"use strict";

const express = require("express");

const { createGetDashboardVasService } = require("../services/service");

const {
  createGetDashboardVasController,
} = require("../controllers/controller");

function createGetDashboardVasRouter({
  Product,
  jwtAuth,
  getAuthorizedSubscriberIds,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const getDashboardVas = createGetDashboardVasService({
    Product,
    getAuthorizedSubscriberIds,
  });

  const controller = createGetDashboardVasController({
    getDashboardVas,
  });

  // Custom subscriber dashboard snapshot.
  router.get("/vasDashboard", jwtAuth, controller);

  return router;
}

module.exports = {
  createGetDashboardVasRouter,
};
