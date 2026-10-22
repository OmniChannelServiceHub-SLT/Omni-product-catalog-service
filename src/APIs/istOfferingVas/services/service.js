"use strict";

const {
  createListOfferingAdvService,
} = require("../../listOfferingAdv/services/service");

function createListOfferingVasService({ ProductOffering, publicBaseUrl }) {
  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return async function listOfferingVas({ query = {} } = {}) {
    if (query.offeringType !== undefined && query.offeringType !== "vasAddon") {
      throw Object.assign(
        new Error("This operation supports offeringType=vasAddon only."),
        { statusCode: 400 },
      );
    }

    const eligibilityInputs = [
      "subscriberID",
      "subscriberid",
      "basepackage",
      "packageName",
    ];

    if (eligibilityInputs.some((key) => query[key] !== undefined)) {
      throw Object.assign(
        new Error(
          "Subscriber/base-package qualification is not " +
            "implemented by this catalog read.",
        ),
        { statusCode: 400 },
      );
    }

    return catalog.listOfferingAdv({
      query: {
        ...query,
        offeringType: "vasAddon",
      },
    });
  };
}

module.exports = { createListOfferingVasService };
