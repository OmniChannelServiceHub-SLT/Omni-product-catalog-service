"use strict";

const express = require("express");
const { createListOfferingDataGiftGiftService } = require("../services/service");
const { createListOfferingDataGiftGiftController } = require("../controllers/controller");

function createListOfferingDataGiftGiftRouter(options) {
  const router = express.Router();
  router.get(
    "/productOffering",
    (req, res, next) => req.query.offeringType === "dataGiftMobile" ? next() : next("route"),
    options.jwtAuth,
    createListOfferingDataGiftGiftController(createListOfferingDataGiftGiftService(options)),
  );
  return router;
}

module.exports = { createListOfferingDataGiftGiftRouter };
