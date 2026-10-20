"use strict";

const express = require("express");

const { createListOfferingDataGiftService } = require("../services/service");

const {
  createListOfferingDataGiftController,
} = require("../controllers/controller");

function createListOfferingDataGiftRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const listOfferingDataGift = createListOfferingDataGiftService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListOfferingDataGiftController({
    listOfferingDataGift,
  });

  router.get(
    "/productOffering",

    // Handle dataGift requests only.
    // Other catalog requests continue to the generic catalog router.
    (req, res, next) => {
      if (req.query.offeringType !== "dataGift") {
        return next("route");
      }

      return next();
    },

    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createListOfferingDataGiftRouter };
