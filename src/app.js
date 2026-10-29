"use strict";

const express = require("express");
const cors = require("cors");

const Product = require("./models/TMF637_product");
const ProductOffering = require("./models/TMF620_productOffering");
const ServiceModel = require("./models/TMF638_service");
const jwtAuth = require("./middleware/jwtAuth.middleware");

const {
  createListProductOrderBbRouter,
} = require("./APIs/listProductOrderBb/routes/route");

const {
  createListOfferingBbPkgRouter,
} = require("./APIs/listOfferingBbPkg/routes/route");

const {
  createRetrieveSubscriptionRouter,
} = require("./APIs/retrieveSubscription/routes/retrieveSubscription.router");

const {
  createGetMyPackageRouter,
} = require("./APIs/getMyPackage/routes/route");

const {
  createRetrieveOfferingBbRouter,
} = require("./APIs/retrieveOfferingBb/routes/route");

const {
  createGetDashboardVasRouter,
} = require("./APIs/getDashboardVas/routes/route");

const {
  createListOfferingAdvRouter,
} = require("./APIs/listOfferingAdv/routes/route");

const {
  createRetrieveServiceRouter,
} = require("./APIs/retrieveService/routes/route");

const {
  createPatchServiceRouter,
} = require("./APIs/patchService/routes/route");

// Load .env in server.js BEFORE importing app.js.
const publicBaseUrl = process.env.BASE_URL;

if (!publicBaseUrl) {
  throw new Error("BASE_URL is required. Load .env before importing app.js.");
}

// Development-only subscriber access.
const developmentAccess = new Map();

if (
  process.env.NODE_ENV === "development" &&
  process.env.DEV_SUBSCRIBER_ACCESS
) {
  let configured;

  try {
    configured = JSON.parse(process.env.DEV_SUBSCRIBER_ACCESS);
  } catch {
    throw new Error("DEV_SUBSCRIBER_ACCESS must contain valid JSON.");
  }

  if (
    !configured ||
    typeof configured !== "object" ||
    Array.isArray(configured)
  ) {
    throw new Error("DEV_SUBSCRIBER_ACCESS must be a JSON object.");
  }

  for (const [subject, ids] of Object.entries(configured)) {
    if (
      !subject.trim() ||
      subject !== subject.trim() ||
      !Array.isArray(ids) ||
      ids.some(
        (id) =>
          typeof id !== "string" ||
          !id.trim() ||
          id !== id.trim() ||
          id.length > 128,
      )
    ) {
      throw new Error(
        "DEV_SUBSCRIBER_ACCESS must map IAM user IDs to subscriber ID arrays.",
      );
    }

    developmentAccess.set(subject, [...new Set(ids)]);
  }
}

async function getAuthorizedSubscriberIds(user) {
  if (process.env.NODE_ENV !== "development" || typeof user?.sub !== "string") {
    return [];
  }

  const ids = developmentAccess.get(user.sub) || [];

  if (process.env.DEBUG_SUBSCRIBER_ACCESS === "true") {
    console.log("[subscriber-access]", {
      userId: user.sub,
      grantedSubscriberCount: ids.length,
    });
  }

  return [...ids];
}

async function authorizeProduct(user, product) {
  return (
    typeof product?.subscriberId === "string" &&
    (await getAuthorizedSubscriberIds(user)).includes(product.subscriberId)
  );
}

// Freedom-status access: explicit development-only mock test grant.
// Live telephone access remains denied until a trusted lookup is implemented.
async function authorizeTelephone(user, telephoneNumber) {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.BB_FREEDOM_MODE === "mock" &&
    typeof user?.sub === "string" &&
    user.sub === process.env.BB_FREEDOM_TEST_USER_ID &&
    telephoneNumber === "0000000000"
  );
}

async function getLegacyAuthorization() {
  return process.env.BB_FREEDOM_AUTHORIZATION;
}

// binding is private provisioning data, never populated from request bodies.
async function authorizeService(user, service) {
  return (
    typeof user?.sub === "string" &&
    typeof service.binding?.ownerSubject === "string" &&
    user.sub === service.binding.ownerSubject
  );
}

const voiceOptions = {
  ServiceModel,
  jwtAuth,
  authorizeService,
  publicBaseUrl,
  providerMode: process.env.VOICE_PROVIDER_MODE || "disabled",
  nodeEnv: process.env.NODE_ENV,
  getLegacyAuthorization: async () => process.env.VOICE_LEGACY_AUTHORIZATION,
};

const app = express();

app.use(
  cors({
    exposedHeaders: [
      "X-Result-Count",
      "X-Total-Count",
      "Content-Location",
      "Accept-Patch",
    ],
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "product-catalog-service",
  });
});

const INVENTORY_BASE_PATH = "/tmf-api/productInventory/v4";
const CATALOG_BASE_PATH = "/tmf-api/productCatalogManagement/v4";
const SERVICE_BASE_PATH = "/tmf-api/serviceInventory/v5";

const catalogOptions = {
  ProductOffering,
  jwtAuth,
  publicBaseUrl,
};

// Targeted catalog handlers before the generic catalog handler.
app.use(CATALOG_BASE_PATH, createRetrieveOfferingBbRouter(catalogOptions));

app.use(CATALOG_BASE_PATH, createListOfferingBbPkgRouter(catalogOptions));

// This generic handler also serves listProductOffering requests.
app.use(CATALOG_BASE_PATH, createListOfferingAdvRouter(catalogOptions));

// Custom VAS dashboard.
app.use(
  "/api",
  createGetDashboardVasRouter({
    Product,
    jwtAuth,
    getAuthorizedSubscriberIds,
  }),
);

// Custom Freedom-request status.
app.use(
  "/api",
  createListProductOrderBbRouter({
    jwtAuth,
    authorizeTelephone,
    getLegacyAuthorization,
  }),
);

// TMF637 — Product collection.
app.use(
  INVENTORY_BASE_PATH,
  createGetMyPackageRouter({
    Product,
    jwtAuth,
    getAuthorizedSubscriberIds,
    publicBaseUrl,
  }),
);

// TMF637 — Product ID retrieval.
app.use(
  INVENTORY_BASE_PATH,
  createRetrieveSubscriptionRouter({
    Product,
    jwtAuth,
    authorizeProduct,
    publicBaseUrl,
  }),
);

// TMF638 v5 — Service retrieval.
app.use(SERVICE_BASE_PATH, createRetrieveServiceRouter(voiceOptions));

// TMF638 v5 — Service update.
app.use(SERVICE_BASE_PATH, createPatchServiceRouter(voiceOptions));

// 404 fallback.
app.use((req, res) => {
  return res.status(404).json({
    code: "404",
    reason: "Not Found",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    status: "404",
    "@type": "Error",
  });
});

// Shared error handler.
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
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
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
        : error.message || reasons[status] || "Request Failed",
    status: String(status),
    "@type": "Error",
  });
});

module.exports = app;
