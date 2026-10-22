"use strict";

const express = require("express");
const cors = require("cors");

// Shared models
const Product = require("./models/TMF637_product");
const ProductOffering = require("./models/TMF620_productOffering");

// TMF638 model — use the actual filename before enabling retrieveService.
// const ServiceModel = require("./models/ACTUAL_TMF638_MODEL");

// Shared JWT authentication middleware
const jwtAuth = require("./middleware/jwtAuth.middleware");

// TMF620 — targeted dataGift handler
const {
  createListOfferingDataGiftRouter,
} = require("./APIs/listOfferingDataGift/routes/route");

// TMF620 — shared catalog router
const {
  createListProductOfferingRouter,
} = require("./APIs/listProductOffering/routes/route");

// TMF637 — getMyPackage
const {
  createGetMyPackageRouter,
} = require("./APIs/getMyPackage/routes/route");

// TMF637 — retrieveSubscription
const {
  createRetrieveSubscriptionRouter,
} = require("./APIs/retrieveSubscription/routes/retrieveSubscription.router");

// TMF638 — retrieveService
// Uncomment after the ServiceModel import is configured.
// const {
//   createRetrieveServiceRouter,
// } = require("./APIs/retrieveService/routes/route");

const app = express();

// General middleware
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
const CATALOG_BASE_PATH = "/tmf-api/productCatalogManagement/v4";
const INVENTORY_BASE_PATH = "/tmf-api/productInventory/v4";
const SERVICE_BASE_PATH = "/tmf-api/serviceInventory/v4";

const publicBaseUrl = process.env.BASE_URL;

if (!publicBaseUrl) {
  throw new Error("BASE_URL is required. Load .env before importing app.js.");
}

// Product ownership policy.
// Implement your actual account-access rules.
async function authorizeProduct(user, product) {
  return false;
}

// Subscriber access policy.
// Return subscriber IDs linked to the verified user.
async function getAuthorizedSubscriberIds(user) {
  return [];
}

// Service access policy.
// Implement ownership, operator permissions and CFS/RFS visibility.
async function authorizeService(user, service) {
  return false;
}

// TMF620 — targeted handlers must come before the generic router.
app.use(
  CATALOG_BASE_PATH,
  createListOfferingDataGiftRouter({
    ProductOffering,
    jwtAuth,
    publicBaseUrl,
  }),
);

// TMF620 — register the generic catalog router ONCE.
// Also handles advancedReporting queries using offeringType.
app.use(
  CATALOG_BASE_PATH,
  createListProductOfferingRouter({
    ProductOffering,
    jwtAuth,
    publicBaseUrl,
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

// TMF638 — enable after configuring the actual ServiceModel import.
// app.use(
//   SERVICE_BASE_PATH,
//   createRetrieveServiceRouter({
//     ServiceModel,
//     jwtAuth,
//     authorizeService,
//     publicBaseUrl,
//   })
// );

// 404 fallback — keep after all API registrations.
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
