"use strict";

const express = require("express");

const {
  createListOfferingDataGiftGiftService,
} = require("../services/service");

const {
  createListOfferingDataGiftGiftController,
} = require("../controllers/controller");

function createListOfferingDataGiftGiftRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const listOfferingDataGiftGift = createListOfferingDataGiftGiftService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createListOfferingDataGiftGiftController({
    listOfferingDataGiftGift,
  });

  router.get(
    "/productOffering",

    // Other offering types continue to their existing handlers.
    (req, res, next) => {
      if (req.query.offeringType !== "dataGiftMobile") {
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
  createListOfferingDataGiftGiftRouter,
};
