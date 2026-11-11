"use strict";

function createListOfferingCurrentBbController({ listOfferingCurrentBb }) {
  return async function listOfferingCurrentBbController(req, res) {
    try {
      const offerings = await listOfferingCurrentBb({ query: req.query });
      res.set("X-Result-Count", String(offerings.length));
      res.set("X-Total-Count", String(offerings.length));
      return res.status(200).json(offerings);
    } catch (error) {
      const status = error.statusCode === 400 ? 400 : 500;
      return res.status(status).json({
        code: String(status),
        reason: status === 400 ? "Bad Request" : "Internal Server Error",
        message:
          status === 400
            ? error.message
            : "Unable to retrieve the current broadband offering.",
        status: String(status),
        "@type": "Error",
      });
    }
  };
}

module.exports = { createListOfferingCurrentBbController };
