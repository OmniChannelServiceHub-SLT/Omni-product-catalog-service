"use strict";

function createRetrieveOfferingBbController({ retrieveOfferingBb }) {
  if (typeof retrieveOfferingBb !== "function") {
    throw new TypeError("retrieveOfferingBb service is required.");
  }

  return async function retrieveOfferingBbController(req, res, next) {
    try {
      const offering = await retrieveOfferingBb({
        id: req.params.id,
        query: req.query,
      });

      if (offering === null) {
        return next("route");
      }

      res.set("Cache-Control", "no-store");

      return res.status(200).json(offering);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createRetrieveOfferingBbController,
};
