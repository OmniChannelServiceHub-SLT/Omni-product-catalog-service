"use strict";

const { createListOfferingAdvService } = require("../../listOfferingAdv/services/service");

function createListOfferingDataGiftService(options) {
  const catalog = createListOfferingAdvService(options);
  return async function listOfferingDataGift({ query }) {
    return catalog.listOfferingAdv({ query: { ...query, offeringType: "dataGift" } });
  };
}

module.exports = { createListOfferingDataGiftService };
