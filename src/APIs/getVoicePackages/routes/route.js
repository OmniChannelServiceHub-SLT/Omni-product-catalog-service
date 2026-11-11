"use strict";

const express = require("express");
const {
  createGetVoicePackagesService,
  extensionSchema,
} = require("../services/service");
const {
  createGetVoicePackagesController,
} = require("../controllers/controller");

function createGetVoicePackagesRouter({ ProductOffering, jwtAuth, publicBaseUrl }) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createGetVoicePackagesService({ ProductOffering, publicBaseUrl });
  const controller = createGetVoicePackagesController(service);

  router.get("/schemas/SLTVoiceProductOffering.schema.json", (req, res) =>
    res.json(extensionSchema),
  );

  router.get(
    "/productOffering",
    (req, res, next) => {
      if (req.query.offeringType !== "voicePackage") {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createGetVoicePackagesRouter };
