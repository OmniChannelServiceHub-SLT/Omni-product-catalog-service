"use strict";

function createRetrieveServiceController({ retrieveService }) {
  return async function retrieveServiceController(req, res) {
    try {
      const service = await retrieveService({
        id: req.params.id,
        query: req.query,
        user: req.user,
      });

      res.set("Cache-Control", "no-store");

      return res.status(200).json(service);
    } catch (error) {
      const status = [400, 401, 403, 404].includes(error.statusCode)
        ? error.statusCode
        : 500;

      const reasons = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
      };

      if (status === 401) {
        res.set("WWW-Authenticate", "Bearer");
      }

      return res.status(status).json({
        code: String(status),
        reason: reasons[status],
        message:
          status === 500 ? "Unable to retrieve the service." : error.message,
        status: String(status),
        "@type": "Error",
      });
    }
  };
}

module.exports = { createRetrieveServiceController };
