"use strict";

const express = require("express");
const {
  createListOfferingService,
  extensionSchema,
} = require("../services/service");
const {
  createListOfferingController,
} = require("../controllers/controller");

function createListOfferingRouter({ ProductOffering, jwtAuth, publicBaseUrl }) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createListOfferingService({ ProductOffering, publicBaseUrl });
  const controller = createListOfferingController(service);

  router.get("/schemas/SLTPeoVasProductOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get(
    "/productOffering",
    (req, res, next) => {
      if (req.query.offeringType !== "peoVasProduct") {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createListOfferingRouter };
