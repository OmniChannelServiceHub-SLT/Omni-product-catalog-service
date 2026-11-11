"use strict";

const express = require("express");
const { createListOfferingVasService, extensionSchema } = require("../services/service");
const { createListOfferingVasController } = require("../controllers/controller");

function createListOfferingVasRouter({ ProductOffering, jwtAuth, publicBaseUrl }) {
  if (typeof jwtAuth !== "function") throw new TypeError("JWT middleware is required.");
  const router = express.Router();
  const service = createListOfferingVasService({ ProductOffering, publicBaseUrl });
  const controller = createListOfferingVasController(service);

  router.get("/schemas/SLTVasProductOffering.schema.json", (req, res) => res.json(extensionSchema));
  router.get(
    "/productOffering",
    (req, res, next) => req.query.offeringType === "vasAddon" ? next() : next("router"),
    jwtAuth,
    controller,
  );
  return router;
}

module.exports = { createListOfferingVasRouter };
