"use strict";

const express = require("express");
const { createListProductService } = require("../services/service");
const { createListProductController } = require("../controllers/controller");

function createListProductRouter({
  Product,
  jwtAuth,
  getAuthorizedSubscriberIds,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();
  const service = createListProductService({
    Product,
    getAuthorizedSubscriberIds,
    publicBaseUrl,
  });
  const controller = createListProductController(service);

  router.get(
    "/product",
    (req, res, next) => {
      if (req.query.productType !== "peoVasSubscription") {
        return next("router");
      }
      return next();
    },
    jwtAuth,
    controller,
  );

  return router;
}

module.exports = { createListProductRouter };
