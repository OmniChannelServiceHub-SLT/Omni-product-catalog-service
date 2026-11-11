"use strict";

const express = require("express");
const {
  createListOfferingCurrentBbService,
  extensionSchema,
} = require("../services/service");
const {
  createListOfferingCurrentBbController,
} = require("../controllers/controller");

function createListOfferingCurrentBbRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createListOfferingCurrentBbService({
    ProductOffering,
    publicBaseUrl,
  });
  const controller = createListOfferingCurrentBbController(service);

  router.get("/schemas/SLTCurrentBroadbandOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get(
    "/productOffering",
    (req, res, next) => {
      if (!("packageType" in req.query) && !("name" in req.query)) {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createListOfferingCurrentBbRouter };
