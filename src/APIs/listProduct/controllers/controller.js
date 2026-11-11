"use strict";

function createListProductController({ listProduct }) {
  return async function listProductController(req, res) {
    try {
      const { products, total } = await listProduct({
        query: req.query,
        user: req.user,
      });
      res.set("X-Result-Count", String(products.length));
      res.set("X-Total-Count", String(total));
      res.set("Cache-Control", "no-store");
      return res.status(200).json(products);
    } catch (error) {
      const expected = [400, 401, 403].includes(error.statusCode);
      const status = expected ? error.statusCode : 500;
      const reasons = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        500: "Internal Server Error",
      };
      if (status === 401) res.set("WWW-Authenticate", "Bearer");
      return res.status(status).json({
        code: String(status),
        reason: reasons[status],
        message:
          status === 500
            ? "Unable to retrieve purchased products."
            : error.message,
        status: String(status),
        "@type": "Error",
      });
    }
  };
}

module.exports = { createListProductController };
