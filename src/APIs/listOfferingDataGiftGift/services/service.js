"use strict";

const { createListOfferingAdvService } = require("../../listOfferingAdv/services/service");

function createListOfferingDataGiftGiftService(options) {
  const catalog = createListOfferingAdvService(options);
  return async function listOfferingDataGiftGift({ query }) {
    return catalog.listOfferingAdv({ query: { ...query, offeringType: "dataGiftMobile" } });
  };
}

module.exports = { createListOfferingDataGiftGiftService };
