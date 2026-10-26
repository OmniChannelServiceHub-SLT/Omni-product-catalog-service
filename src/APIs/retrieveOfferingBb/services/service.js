"use strict";

const {
  createListOfferingAdvService,
} = require("../../listOfferingAdv/services/service");

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function createRetrieveOfferingBbService({ ProductOffering, publicBaseUrl }) {
  const catalog = createListOfferingAdvService({
    ProductOffering,
    publicBaseUrl,
  });

  return async function retrieveOfferingBb({ id, query = {} }) {
    if (Object.keys(query).some((key) => key !== "fields")) {
      throw fail(400, "Only fields is supported for ID retrieval.");
    }

    let fields;

    if (query.fields !== undefined) {
      if (typeof query.fields !== "string") {
        throw fail(400, "fields must be a comma-separated string.");
      }

      fields = query.fields.split(",").map((field) => field.trim());
    }

    // Include offeringType internally so sparse field selection
    // cannot bypass the broadband offering check.
    const offering = await catalog.retrieveOffering({
      id,
      query: fields
        ? {
            fields: [...fields, "offeringType"].join(","),
          }
        : {},
    });

    // Let another catalog router handle other offering types.
    if (offering.offeringType !== "broadbandPackage") {
      return null;
    }

    if (fields && !fields.includes("offeringType")) {
      delete offering.offeringType;
    }

    return offering;
  };
}

module.exports = {
  createRetrieveOfferingBbService,
};
