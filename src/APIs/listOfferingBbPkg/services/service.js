"use strict";

const {
  createListOfferingAdvService,
} = require("../../listOfferingAdv/services/service");

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function createListOfferingBbPkgService({ ProductOffering, publicBaseUrl }) {
  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return async function listOfferingBbPkg({ query = {} } = {}) {
    if (
      query.offeringType !== undefined &&
      query.offeringType !== "broadbandPackage"
    ) {
      throw fail(
        400,
        "This operation supports offeringType=broadbandPackage only.",
      );
    }

    if (query.type !== undefined || query.package !== undefined) {
      throw fail(
        400,
        "Legacy type/package comparison inputs are not supported by this catalog operation.",
      );
    }

    // The shared service validates filters, fields and pagination.
    // Always scope both the result count and records to broadband.
    return catalog.listOfferingAdv({
      query: {
        ...query,
        offeringType: "broadbandPackage",
      },
    });
  };
}

module.exports = {
  createListOfferingBbPkgService,
};
