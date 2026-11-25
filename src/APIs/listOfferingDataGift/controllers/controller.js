"use strict";

const { createListOfferingAdvController } = require("../../listOfferingAdv/controllers/controller");

function createListOfferingDataGiftController(listOfferingDataGift) {
  return createListOfferingAdvController({ listOfferingAdv: listOfferingDataGift }).listOfferingAdv;
}

module.exports = { createListOfferingDataGiftController };
