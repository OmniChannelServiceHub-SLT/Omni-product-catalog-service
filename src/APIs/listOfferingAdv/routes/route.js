"use strict";

const express = require("express");

const {
  createListOfferingAdvService,
  extensionSchema,
} = require("../services/service");

const {
  createListOfferingAdvController,
} = require("../controllers/controller");

function createListOfferingAdvRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const service = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListOfferingAdvController(service);

  router.get("/schemas/SLTProductOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get("/productOffering", jwtAuth, controller.listOfferingAdv);

  router.get("/productOffering/:id", jwtAuth, controller.retrieveOffering);

  return router;
}

module.exports = { createListOfferingAdvRouter };
