"use strict";

function createListOfferingBbPkgController({ listOfferingBbPkg }) {
  if (typeof listOfferingBbPkg !== "function") {
    throw new TypeError("listOfferingBbPkg service is required.");
  }

  return async function listOfferingBbPkgController(req, res, next) {
    try {
      const { offerings, total } = await listOfferingBbPkg({
        query: req.query,
      });

      res.set("X-Result-Count", String(offerings.length));
      res.set("X-Total-Count", String(total));
      res.set("Cache-Control", "no-store");

      return res.status(200).json(offerings);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createListOfferingBbPkgController,
};
