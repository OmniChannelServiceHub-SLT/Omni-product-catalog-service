"use strict";

function createListProductOrderBbController({ listProductOrderBb }) {
  if (typeof listProductOrderBb !== "function") {
    throw new TypeError("listProductOrderBb service is required.");
  }

  return async function listProductOrderBbController(req, res, next) {
    res.set("Cache-Control", "no-store");

    try {
      const result = await listProductOrderBb({
        query: req.query,
        user: req.user,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createListProductOrderBbController,
};
