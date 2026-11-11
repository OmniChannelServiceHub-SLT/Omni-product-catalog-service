"use strict";

const express = require("express");
const {
  createGetPeoPackagesService,
  extensionSchema,
} = require("../services/service");
const {
  createGetPeoPackagesController,
} = require("../controllers/controller");

function createGetPeoPackagesRouter({ ProductOffering, jwtAuth, publicBaseUrl }) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createGetPeoPackagesService({ ProductOffering, publicBaseUrl });
  const controller = createGetPeoPackagesController(service);

  router.get("/schemas/SLTPeoProductOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get(
    "/productOffering",
    (req, res, next) => {
      if (req.query.offeringType !== "peoPackage") {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createGetPeoPackagesRouter };
