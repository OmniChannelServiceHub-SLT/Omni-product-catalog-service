"use strict";

const express = require("express");

const { createGetMyPackageService } = require("../services/service");

const { createGetMyPackageController } = require("../controllers/controller");

function createGetMyPackageRouter({
  Product,
  jwtAuth,
  getAuthorizedSubscriberIds,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const getMyPackage = createGetMyPackageService({
    Product,
    getAuthorizedSubscriberIds,
    publicBaseUrl,
  });

  const controller = createGetMyPackageController({
    getMyPackage,
  });

  router.get("/product", jwtAuth, controller);

  return router;
}

module.exports = { createGetMyPackageRouter };
