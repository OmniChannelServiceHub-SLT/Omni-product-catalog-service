"use strict";

const {
  createListOfferingAdvService,
} = require("../../listOfferingAdv/services/service");

function createListOfferingDataGiftGiftService({
  ProductOffering,
  publicBaseUrl,
}) {
  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return async function listOfferingDataGiftGift({ query = {} } = {}) {
    if (
      query.offeringType !== undefined &&
      query.offeringType !== "dataGiftMobile"
    ) {
      throw Object.assign(
        new Error("This operation supports offeringType=dataGiftMobile only."),
        { statusCode: 400 },
      );
    }

    if (query.subscriberID !== undefined || query.subscriberid !== undefined) {
      throw Object.assign(
        new Error(
          "Subscriber-specific mobile gift eligibility is not " +
            "implemented by this catalog read.",
        ),
        { statusCode: 400 },
      );
    }

    return catalog.listOfferingAdv({
      query: {
        ...query,
        offeringType: "dataGiftMobile",
      },
    });
  };
}

module.exports = {
  createListOfferingDataGiftGiftService,
};
