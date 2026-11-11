"use strict";

const express = require("express");
const {
  createGetBbPackagesInterimService,
  extensionSchema,
} = require("../services/service");
const {
  createGetBbPackagesInterimController,
} = require("../controllers/controller");

function createGetBbPackagesInterimRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createGetBbPackagesInterimService({
    ProductOffering,
    publicBaseUrl,
  });
  const controller = createGetBbPackagesInterimController(service);

  router.get("/schemas/SLTBroadbandOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get(
    "/productOffering",
    (req, res, next) => {
      if (!("packageType" in req.query) || "name" in req.query) {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createGetBbPackagesInterimRouter };
