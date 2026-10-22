"use strict";

const express = require("express");

const { createListOfferingVasService } = require("../services/service");

const {
  createListOfferingVasController,
} = require("../controllers/controller");

function createListOfferingVasRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const listOfferingVas = createListOfferingVasService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListOfferingVasController({
    listOfferingVas,
  });

  router.get(
    "/productOffering",

    // Handle VAS requests; pass other types to the generic router.
    (req, res, next) => {
      if (req.query.offeringType !== "vasAddon") {
        return next("route");
      }

      return next();
    },

    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createListOfferingVasRouter };
