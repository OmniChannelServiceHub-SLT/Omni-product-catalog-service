"use strict";

const OFFERING_TYPES = [
  "vasAddon",
  "broadbandPackage",
  "dataGift",
  "dataGiftMobile",
  "advancedReporting",
];

const FIELDS = new Set([
  "id",
  "href",
  "description",
  "isBundle",
  "isSellable",
  "lastUpdate",
  "lifecycleStatus",
  "name",
  "statusReason",
  "version",
  "agreement",
  "attachment",
  "bundledProductOffering",
  "category",
  "channel",
  "marketSegment",
  "place",
  "prodSpecCharValueUse",
  "productOfferingPrice",
  "productOfferingTerm",
  "productSpecification",
  "resourceCandidate",
  "serviceCandidate",
  "serviceLevelAgreement",
  "validFor",
  "@baseType",
  "@schemaLocation",
  "@type",
  "offeringType",
  "packageId",
  "categoryLabel",
  "legacyPricing",
]);

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTProductOffering",
  type: "object",
  required: ["id", "href", "name", "@type", "@baseType", "@schemaLocation"],
  properties: {
    id: { type: "string" },
    href: { type: "string", format: "uri" },
    name: { type: "string" },
    description: { type: "string" },
    lastUpdate: { type: "string", format: "date-time" },
    "@type": { const: "SLTProductOffering" },
    "@baseType": { const: "ProductOffering" },
    "@schemaLocation": { type: "string", format: "uri" },
    offeringType: {
      type: "string",
      enum: OFFERING_TYPES,
    },
    packageId: { type: "string" },
    categoryLabel: { type: "string" },
    legacyPricing: {
      type: "object",
      description: "Uninterpreted source pricing strings.",
      properties: {
        prePrice: { type: "string" },
        postPrice: { type: "string" },
        taxValue: { type: "string" },
      },
      additionalProperties: false,
    },
  },
};

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function pagination(value, fallback, maximum) {
  if (value === undefined) return fallback;

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw fail(400, "offset and limit must be nonnegative integers.");
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number) || number > maximum) {
    throw fail(400, "Pagination value is outside the supported range.");
  }

  return number;
}

function createListOfferingAdvService({ ProductOffering, publicBaseUrl }) {
  if (
    !ProductOffering ||
    typeof ProductOffering.find !== "function" ||
    typeof ProductOffering.findOne !== "function" ||
    typeof ProductOffering.countDocuments !== "function"
  ) {
    throw new TypeError("Supply your existing TMF620_productOffering model.");
  }

  const base = new URL(publicBaseUrl);

  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new TypeError(
      "BASE_URL must be a trusted HTTP(S) origin/deployment prefix.",
    );
  }

  const apiBase =
    base.href.replace(/\/$/, "") + "/tmf-api/productCatalogManagement/v4";

  function selection(fields) {
    if (fields === undefined) return null;

    if (typeof fields !== "string") {
      throw fail(400, "fields must be a comma-separated string.");
    }

    const chosen = fields.split(",").map((field) => field.trim());

    if (chosen.some((field) => !FIELDS.has(field))) {
      throw fail(400, "Unsupported first-level ProductOffering field.");
    }

    return [...new Set(["id", "href", ...chosen])];
  }

  function represent(record, chosen) {
    const id = record._id && String(record._id);

    if (
      !id ||
      typeof record.name !== "string" ||
      !record.name ||
      typeof record.packageId !== "string" ||
      !OFFERING_TYPES.includes(record.offeringType)
    ) {
      throw new Error("Stored offering is incomplete.");
    }

    const result = {
      id,
      href: apiBase + "/productOffering/" + encodeURIComponent(id),
      name: record.name,
      "@type": "SLTProductOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": apiBase + "/schemas/SLTProductOffering.schema.json",
      offeringType: record.offeringType,
      packageId: record.packageId,
    };

    if (typeof record.description === "string") {
      result.description = record.description;
    }

    if (record.updatedAt) {
      const updated = new Date(record.updatedAt);

      if (!Number.isFinite(updated.getTime())) {
        throw new Error("Stored offering has an invalid update time.");
      }

      result.lastUpdate = updated.toISOString();
    }

    // No CategoryRef is invented from a category label.
    if (typeof record.category === "string") {
      result.categoryLabel = record.category;
    }

    // Preserve prices without guessing prepaid/postpaid or tax semantics.
    const legacyPricing = {};

    for (const key of ["prePrice", "postPrice", "taxValue"]) {
      if (typeof record[key] === "string") {
        legacyPricing[key] = record[key];
      }
    }

    if (Object.keys(legacyPricing).length) {
      result.legacyPricing = legacyPricing;
    }

    if (!chosen) return result;

    return Object.fromEntries(
      chosen
        .filter((key) => result[key] !== undefined)
        .map((key) => [key, result[key]]),
    );
  }

  async function listOfferingAdv({ query = {} }) {
    const allowed = new Set([
      "fields",
      "offset",
      "limit",
      "offeringType",
      "name",
      "id",
      "packageId",
    ]);

    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Unsupported query filter.");
    }

    const chosen = selection(query.fields);
    const offset = pagination(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = pagination(query.limit, 100, 1000);

    const filter = {};

    for (const key of ["offeringType", "name", "id", "packageId"]) {
      const value = query[key];

      if (value === undefined) continue;

      if (typeof value !== "string" || !value.trim() || value.length > 256) {
        throw fail(400, key + " must be a nonempty string.");
      }

      if (key === "offeringType" && !OFFERING_TYPES.includes(value)) {
        throw fail(400, "Unknown offeringType.");
      }

      if (key === "id") {
        if (!/^[a-fA-F0-9]{24}$/.test(value)) {
          return { offerings: [], total: 0 };
        }

        filter._id = value;
      } else {
        filter[key] = value;
      }
    }

    const total = await ProductOffering.countDocuments(filter);

    // MongoDB limit(0) means unlimited; handle zero explicitly.
    if (limit === 0) {
      return { offerings: [], total };
    }

    const rows = await ProductOffering.find(filter)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return {
      offerings: rows.map((row) => represent(row, chosen)),
      total,
    };
  }

  async function retrieveOffering({ id, query = {} }) {
    if (Object.keys(query).some((key) => key !== "fields")) {
      throw fail(400, "Only fields is supported for ID retrieval.");
    }

    const chosen = selection(query.fields);

    if (typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
      throw fail(404, "Product offering not found.");
    }

    const record = await ProductOffering.findOne({
      _id: id,
    }).lean();

    if (!record) {
      throw fail(404, "Product offering not found.");
    }

    return represent(record, chosen);
  }

  return { listOfferingAdv, retrieveOffering };
}

module.exports = {
  createListOfferingAdvService,
  extensionSchema,
};
