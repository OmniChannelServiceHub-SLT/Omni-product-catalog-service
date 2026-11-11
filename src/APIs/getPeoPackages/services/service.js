"use strict";

const FIELDS = new Set([
  "id",
  "href",
  "name",
  "lastUpdate",
  "lifecycleStatus",
  "productOfferingPrice",
  "prodSpecCharValueUse",
  "offeringType",
  "accessType",
  "packageId",
  "@baseType",
  "@schemaLocation",
  "@type",
]);

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function pageValue(value, fallback, maximum) {
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

function fieldSelection(fields) {
  if (fields === undefined) return null;
  if (typeof fields !== "string" || !fields.trim()) {
    throw fail(400, "fields must be a nonempty comma-separated string.");
  }
  const selected = fields.split(",").map((field) => field.trim());
  if (selected.some((field) => !FIELDS.has(field))) {
    throw fail(400, "Unsupported first-level ProductOffering field.");
  }
  return [...new Set(["id", "href", ...selected])];
}

function createGetPeoPackagesService({ ProductOffering, publicBaseUrl }) {
  if (
    !ProductOffering ||
    typeof ProductOffering.find !== "function" ||
    typeof ProductOffering.countDocuments !== "function"
  ) {
    throw new TypeError("Supply the TMF620 ProductOffering model.");
  }

  const base = new URL(publicBaseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new TypeError("BASE_URL must be a trusted HTTP(S) origin/deployment prefix.");
  }
  const apiBase =
    base.href.replace(/\/$/, "") + "/tmf-api/productCatalogManagement/v4";

  function represent(record, selected) {
    const id = record?._id && String(record._id);
    if (
      !id ||
      typeof record.name !== "string" ||
      typeof record.packageId !== "string" ||
      typeof record.accessType !== "string"
    ) {
      throw new Error("Stored PEO offering is incomplete.");
    }

    const result = {
      id,
      href: `${apiBase}/productOffering/${encodeURIComponent(id)}`,
      name: record.name,
      lifecycleStatus: "Active",
      offeringType: "peoPackage",
      accessType: record.accessType,
      packageId: record.packageId,
      "@type": "SLTPeoProductOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": `${apiBase}/schemas/SLTPeoProductOffering.schema.json`,
    };

    if (record.updatedAt) {
      const updated = new Date(record.updatedAt);
      if (!Number.isFinite(updated.getTime())) {
        throw new Error("Stored offering has an invalid update time.");
      }
      result.lastUpdate = updated.toISOString();
    }
    if (Number.isFinite(record.monthlyRental)) {
      result.productOfferingPrice = [
        {
          name: "Monthly rental",
          priceType: "recurring",
          recurringChargePeriod: "month",
          price: { unit: "LKR", value: record.monthlyRental },
          "@type": "ProductOfferingPrice",
        },
      ];
    }
    if (Number.isFinite(record.channelCount)) {
      result.prodSpecCharValueUse = [
        {
          name: "channelCount",
          valueType: "number",
          minCardinality: 1,
          maxCardinality: 1,
          productSpecCharacteristicValue: [
            {
              value: record.channelCount,
              "@type": "ProductSpecificationCharacteristicValue",
            },
          ],
          "@type": "ProductSpecificationCharacteristicValueUse",
        },
      ];
    }

    if (!selected) return result;
    return Object.fromEntries(
      selected
        .filter((field) => result[field] !== undefined)
        .map((field) => [field, result[field]]),
    );
  }

  async function getPeoPackages({ query = {} }) {
    const allowed = new Set([
      "offeringType",
      "accessType",
      "fields",
      "offset",
      "limit",
    ]);
    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Unsupported ProductOffering filter.");
    }
    if (query.offeringType !== "peoPackage") {
      throw fail(400, "offeringType must be peoPackage.");
    }
    if (
      typeof query.accessType !== "string" ||
      !query.accessType.trim() ||
      query.accessType !== query.accessType.trim() ||
      query.accessType.length > 64
    ) {
      throw fail(400, "accessType must be a trimmed, nonempty string.");
    }

    const filter = {
      offeringType: "peoPackage",
      accessType: query.accessType,
    };
    const selected = fieldSelection(query.fields);
    const offset = pageValue(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = pageValue(query.limit, 100, 1000);
    const total = await ProductOffering.countDocuments(filter);
    if (limit === 0) return { offerings: [], total };

    const rows = await ProductOffering.find(filter)
      .sort({ tier: 1, _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return { offerings: rows.map((row) => represent(row, selected)), total };
  }

  return { getPeoPackages };
}

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTPeoProductOffering",
  type: "object",
  required: ["id", "href", "name", "offeringType", "accessType", "packageId", "@type"],
  properties: {
    offeringType: { const: "peoPackage" },
    accessType: { type: "string" },
    packageId: { type: "string" },
    "@type": { const: "SLTPeoProductOffering" },
    "@baseType": { const: "ProductOffering" },
  },
};

module.exports = { createGetPeoPackagesService, extensionSchema };
