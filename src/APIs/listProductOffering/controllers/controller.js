"use strict";

function createListProductOfferingController({
  listProductOffering,
  retrieveProductOffering,
}) {
  function sendError(error, res) {
    const status = [400, 404].includes(error.statusCode)
      ? error.statusCode
      : 500;

    const reasons = {
      400: "Bad Request",
      404: "Not Found",
      500: "Internal Server Error",
    };

    return res.status(status).json({
      code: String(status),
      reason: reasons[status],
      message:
        status === 500
          ? "Unable to retrieve catalog offerings."
          : error.message,
      status: String(status),
      "@type": "Error",
    });
  }

  return {
    async listProductOffering(req, res) {
      try {
        const { offerings, total } = await listProductOffering({
          query: req.query,
        });

        res.set("X-Result-Count", String(offerings.length));
        res.set("X-Total-Count", String(total));

        return res.status(200).json(offerings);
      } catch (error) {
        return sendError(error, res);
      }
    },

    async retrieveProductOffering(req, res) {
      try {
        const offering = await retrieveProductOffering({
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

module.exports = { createListProductOfferingController };
