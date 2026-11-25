"use strict";

const express = require("express");
const { createListOfferingDataGiftService } = require("../services/service");
const { createListOfferingDataGiftController } = require("../controllers/controller");

function createListOfferingDataGiftRouter(options) {
  const router = express.Router();
  router.get(
    "/productOffering",
    (req, res, next) => req.query.offeringType === "dataGift" ? next() : next("route"),
    options.jwtAuth,
    createListOfferingDataGiftController(createListOfferingDataGiftService(options)),
  );
  return router;
}

module.exports = { createListOfferingDataGiftRouter };
