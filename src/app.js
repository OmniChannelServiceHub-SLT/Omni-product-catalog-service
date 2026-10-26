"use strict";

const express = require("express");
const cors = require("cors");

// Shared models
const Product = require("./models/TMF637_product");
const ProductOffering = require("./models/TMF620_productOffering");

// listProductOrderBb  Custom — Broadband Freedom request status
const {
  createListProductOrderBbRouter,
} = require("./APIs/listProductOrderBb/routes/route");

// Shared authentication middleware
const jwtAuth = require("./middleware/jwtAuth.middleware");

// TMF637 — retrieveSubscription
const {
  createRetrieveSubscriptionRouter,
} = require("./APIs/retrieveSubscription/routes/retrieveSubscription.router");

// TMF637 — getMyPackage
const {
  createGetMyPackageRouter,
} = require("./APIs/getMyPackage/routes/route");

// TMF620 — listOfferingAdv
const {
  createListOfferingAdvRouter,
} = require("./APIs/listOfferingAdv/routes/route");

const app = express();

app.use(
  cors({
    exposedHeaders: ["X-Result-Count", "X-Total-Count"],
  }),
);

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "product-catalog-service",
  });
});

// TMF API base paths
const INVENTORY_BASE_PATH = "/tmf-api/productInventory/v4";
const CATALOG_BASE_PATH = "/tmf-api/productCatalogManagement/v4";

const publicBaseUrl = process.env.BASE_URL;

if (!publicBaseUrl) {
  throw new Error("BASE_URL is required. Load .env before importing app.js.");
}

// Connect your actual product/account ownership policy here.
// Access remains denied until the policy is implemented.
async function authorizeProduct(user, product) {
  return false;
}

// Return subscriber IDs that the authenticated user may access.
// Connect this function to your server-side account lookup.
async function getAuthorizedSubscriberIds(user) {
  return [];
}

// TMF620 — Catalog routes
app.use(
  CATALOG_BASE_PATH,
  createListOfferingAdvRouter({
    ProductOffering,
    jwtAuth,
    publicBaseUrl,
  }),
);

// listProductOrderBb  Connect this to your server-side account ownership lookup.
async function authorizeTelephone(user, telephoneNumber) {
  return false;
}

// Obtain the Authorization header expected by the legacy provider.
// Do not assume your IAM access token is accepted by the legacy API.
async function getLegacyAuthorization() {
  return process.env.BB_FREEDOM_AUTHORIZATION;
}

app.use(
  "/api",
  createListProductOrderBbRouter({
    jwtAuth,
    authorizeTelephone,
    getLegacyAuthorization,
  }),
);

// TMF637 — Product collection
app.use(
  INVENTORY_BASE_PATH,
  createGetMyPackageRouter({
    Product,
    jwtAuth,
    getAuthorizedSubscriberIds,
    publicBaseUrl,
  }),
);

// TMF637 — Product ID retrieval
app.use(
  INVENTORY_BASE_PATH,
  createRetrieveSubscriptionRouter({
    Product,
    jwtAuth,
    authorizeProduct,
    publicBaseUrl,
  }),
);

// Register additional API routes ABOVE this handler.

// 404 fallback
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
    409: "Conflict",
    413: "Payload Too Large",
    415: "Unsupported Media Type",
    429: "Too Many Requests",
    500: "Internal Server Error",
    503: "Service Unavailable",
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
