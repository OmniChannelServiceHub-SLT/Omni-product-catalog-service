"use strict";

const { createListOfferingAdvController } = require("../../listOfferingAdv/controllers/controller");

function createListOfferingDataGiftGiftController(listOfferingDataGiftGift) {
  return createListOfferingAdvController({ listOfferingAdv: listOfferingDataGiftGift }).listOfferingAdv;
}

module.exports = { createListOfferingDataGiftGiftController };
