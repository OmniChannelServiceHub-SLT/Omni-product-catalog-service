"use strict";

const {
  createListOfferingAdvService,
} = require("../../listOfferingAdv/services/service");

function createListOfferingDataGiftService({ ProductOffering, publicBaseUrl }) {
  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return async function listOfferingDataGift({ query = {} } = {}) {
    if (query.offeringType !== undefined && query.offeringType !== "dataGift") {
      throw Object.assign(
        new Error("This operation supports offeringType=dataGift only."),
        { statusCode: 400 },
      );
    }

    if (query.subscriberID !== undefined || query.subscriberid !== undefined) {
      throw Object.assign(
        new Error(
          "Subscriber-specific gift eligibility is not implemented " +
            "by this catalog read.",
        ),
        { statusCode: 400 },
      );
    }

    return catalog.listOfferingAdv({
      query: {
        ...query,
        offeringType: "dataGift",
      },
    });
  };
}

module.exports = { createListOfferingDataGiftService };
