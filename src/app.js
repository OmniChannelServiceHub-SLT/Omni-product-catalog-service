"use strict";

const express = require("express");
const cors = require("cors");

const Product = require("./models/TMF637_product");
const jwtAuth = require("./middleware/jwtAuth.middleware");

// Existing retrieveSubscription API
const {
  createRetrieveSubscriptionRouter,
} = require("./APIs/retrieveSubscription/routes/retrieveSubscription.router");

// getMyPackage API — matches your routes/route.js filename
const {
  createGetMyPackageRouter,
} = require("./APIs/getMyPackage/routes/route");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "product-catalog-service",
  });
});

const INVENTORY_BASE_PATH = "/tmf-api/productInventory/v4";
const publicBaseUrl = process.env.BASE_URL;

if (!publicBaseUrl) {
  throw new Error("BASE_URL is required. Load .env before importing app.js.");
}

// Implement your actual product/account ownership policy.
async function authorizeProduct(user, product) {
  return false;
}

// Implement a server-side lookup of subscriber IDs
// that this verified user is permitted to access.
async function getAuthorizedSubscriberIds(user) {
  return [];
}

// GET /tmf-api/productInventory/v4/product
app.use(
  INVENTORY_BASE_PATH,
  createGetMyPackageRouter({
    Product,
    jwtAuth,
    getAuthorizedSubscriberIds,
    publicBaseUrl,
  }),
);

// GET /tmf-api/productInventory/v4/product/:id
app.use(
  INVENTORY_BASE_PATH,
  createRetrieveSubscriptionRouter({
    Product,
    jwtAuth,
    authorizeProduct,
    publicBaseUrl,
  }),
);

// Register any additional API routes ABOVE this handler.
app.use((req, res) => {
  return res.status(404).json({
    code: "404",
    reason: "Not Found",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    status: "404",
    "@type": "Error",
  });
});

// Shared error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const candidate = error.statusCode ?? error.status;

  const status =
    Number.isInteger(candidate) && candidate >= 400 && candidate <= 599
      ? candidate
      : 500;

  const reasons = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    413: "Payload Too Large",
    500: "Internal Server Error",
  };

  if (status === 401) {
    res.set("WWW-Authenticate", "Bearer");
  }

  return res.status(status).json({
    code: String(status),
    reason: reasons[status] || "Request Failed",
    message:
      status >= 500
        ? "An unexpected server error occurred."
        : reasons[status] || "The request could not be processed.",
    status: String(status),
    "@type": "Error",
  });
});

module.exports = app;
