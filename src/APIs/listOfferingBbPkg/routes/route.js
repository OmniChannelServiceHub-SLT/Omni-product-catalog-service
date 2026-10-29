"use strict";

const express = require("express");

const { createListOfferingBbPkgService } = require("../services/service");

const {
  createListOfferingBbPkgController,
} = require("../controllers/controller");

function createListOfferingBbPkgRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const listOfferingBbPkg = createListOfferingBbPkgService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListOfferingBbPkgController({
    listOfferingBbPkg,
  });

  router.get(
    "/productOffering",
    (req, res, next) => {
      // Other catalog queries continue to the generic router.
      if (req.query.offeringType !== "broadbandPackage") {
        return next("route");
      }

      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = {
  createListOfferingBbPkgRouter,
};
