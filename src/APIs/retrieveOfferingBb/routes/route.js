"use strict";

const express = require("express");

const { createRetrieveOfferingBbService } = require("../services/service");

const {
  createRetrieveOfferingBbController,
} = require("../controllers/controller");

function createRetrieveOfferingBbRouter({
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
}) {
  if (typeof jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }

  const router = express.Router();

  const retrieveOfferingBb = createRetrieveOfferingBbService({
    ProductOffering,
    publicBaseUrl,
  });

  const controller = createRetrieveOfferingBbController({
    retrieveOfferingBb,
  });

  router.get("/productOffering/:id", jwtAuth, controller);

  return router;
}

module.exports = {
  createRetrieveOfferingBbRouter,
};
