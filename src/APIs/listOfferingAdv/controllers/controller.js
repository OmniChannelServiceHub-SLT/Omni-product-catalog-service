"use strict";

function createListOfferingAdvController({
  listOfferingAdv,
  retrieveOffering,
}) {
  function sendError(error, res) {
    const expected = [400, 404].includes(error.statusCode);
    const status = expected ? error.statusCode : 500;

    const reasons = {
      400: "Bad Request",
      404: "Not Found",
      500: "Internal Server Error",
    };

    return res.status(status).json({
      code: String(status),
      reason: reasons[status],
      message: expected
        ? error.message
        : "Unable to retrieve catalog offerings.",
      status: String(status),
      "@type": "Error",
    });
  }

  return {
    async listOfferingAdv(req, res) {
      try {
        const { offerings, total } = await listOfferingAdv({
          query: req.query,
        });

        res.set("X-Result-Count", String(offerings.length));
        res.set("X-Total-Count", String(total));

        return res.status(200).json(offerings);
      } catch (error) {
        return sendError(error, res);
      }
    },

    async retrieveOffering(req, res) {
      try {
        const offering = await retrieveOffering({
          id: req.params.id,
          query: req.query,
        });

        return res.status(200).json(offering);
      } catch (error) {
        return sendError(error, res);
      }
    },
  };
}

module.exports = { createListOfferingAdvController };
