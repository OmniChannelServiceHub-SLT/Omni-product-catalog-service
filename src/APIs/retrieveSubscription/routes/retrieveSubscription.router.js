"use strict";

const express = require("express");
const {
  createRetrieveSubscriptionService,
} = require("../services/retrieveSubscription.service");
const {
  createRetrieveSubscriptionController,
} = require("../controller/retrieveSubscription.controller");

// Mount at /tmf-api/productInventory/v4 in src/app.js.
// Standard OpenAPI operationId: retrieveProduct.
// Internal Excel name/folder: retrieveSubscription.
function createRetrieveSubscriptionRouter({
  Product,
  jwtAuth,
  authorizeProduct,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT authentication middleware is required.");
  }
  const router = express.Router();
  const retrieveSubscription = createRetrieveSubscriptionService({
    Product,
    authorizeProduct,
    publicBaseUrl,
  });
  const controller = createRetrieveSubscriptionController({
    retrieveSubscription,
  });

  router.get("/product/:id", jwtAuth, controller);
  //router.get("/product/:id", controller);
  // POST/PATCH/DELETE for this resource will be registered by later APIs.
  return router;
}

module.exports = { createRetrieveSubscriptionRouter };
