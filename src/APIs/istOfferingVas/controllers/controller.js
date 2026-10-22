"use strict";

function createListOfferingVasController({ listOfferingVas }) {
  return async function listOfferingVasController(req, res) {
    try {
      const { offerings, total } = await listOfferingVas({
        query: req.query,
      });

      res.set("X-Result-Count", String(offerings.length));
      res.set("X-Total-Count", String(total));

      return res.status(200).json(offerings);
    } catch (error) {
      const status = error.statusCode === 400 ? 400 : 500;

      return res.status(status).json({
        code: String(status),
        reason: status === 400 ? "Bad Request" : "Internal Server Error",
        message:
          status === 400 ? error.message : "Unable to retrieve VAS offerings.",
        status: String(status),
        "@type": "Error",
      });
    }
  };
}

module.exports = { createListOfferingVasController };
