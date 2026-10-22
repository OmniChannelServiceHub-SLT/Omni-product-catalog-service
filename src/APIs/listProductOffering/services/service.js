"use strict";

const {
  createListOfferingAdvService,
  extensionSchema,
} = require("../../listOfferingAdv/services/service");

function createListProductOfferingService({ ProductOffering, publicBaseUrl }) {
  if (typeof createListOfferingAdvService !== "function") {
    throw new TypeError(
      "listOfferingAdv/services/service.js must export " +
        "createListOfferingAdvService.",
    );
  }

  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return {
    listProductOffering: catalog.listOfferingAdv,
    retrieveProductOffering: catalog.retrieveOffering,
  };
}

module.exports = {
  createListProductOfferingService,
  extensionSchema,
};
