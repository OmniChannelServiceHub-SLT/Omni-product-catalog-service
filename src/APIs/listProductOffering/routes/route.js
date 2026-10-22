"use strict";

const express = require("express");

const {
  createListProductOfferingService,
  extensionSchema,
} = require("../services/service");

const {
  createListProductOfferingController,
} = require("../controllers/controller");

function createListProductOfferingRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const service = createListProductOfferingService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListProductOfferingController(service);

  // Extension-schema documentation
  router.get("/schemas/SLTProductOffering.schema.json", (req, res) => {
    return res.json(extensionSchema);
  });

  // List catalog offerings
  router.get("/productOffering", jwtAuth, controller.listProductOffering);

  // Retrieve one catalog offering
  router.get(
    "/productOffering/:id",
    jwtAuth,
    controller.retrieveProductOffering,
  );

  return router;
}

module.exports = { createListProductOfferingRouter };
