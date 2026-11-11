"use strict";

const FIELDS = new Set([
  "id",
  "href",
  "name",
  "lastUpdate",
  "lifecycleStatus",
  "productOfferingPrice",
  "prodSpecCharValueUse",
  "packageType",
  "packageGroup",
  "packageId",
  "@baseType",
  "@schemaLocation",
  "@type",
]);

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function nonnegativeInteger(value, fallback, maximum) {
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

function selectedFields(fields) {
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

function characteristic(name, value) {
  return {
    name,
    valueType: "number",
    minCardinality: 1,
    maxCardinality: 1,
    productSpecCharacteristicValue: [
      {
        value,
        unitOfMeasure: "GB",
        "@type": "ProductSpecificationCharacteristicValue",
      },
    ],
    "@type": "ProductSpecificationCharacteristicValueUse",
  };
}

function createGetBbPackagesInterimService({ ProductOffering, publicBaseUrl }) {
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
      typeof record.packageType !== "string"
    ) {
      throw new Error("Stored broadband offering is incomplete.");
    }

    const result = {
      id,
      href: `${apiBase}/productOffering/${encodeURIComponent(id)}`,
      name: record.name,
      lifecycleStatus: "Active",
      packageType: record.packageType,
      packageId: record.packageId,
      "@type": "SLTBroadbandOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": `${apiBase}/schemas/SLTBroadbandOffering.schema.json`,
    };

    if (typeof record.packageGroup === "string") {
      result.packageGroup = record.packageGroup;
    }
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

    const characteristics = [];
    if (Number.isFinite(record.standardGB)) {
      characteristics.push(characteristic("standardDataAllowance", record.standardGB));
    }
    if (Number.isFinite(record.freeGB)) {
      characteristics.push(characteristic("freeDataAllowance", record.freeGB));
    }
    if (characteristics.length) result.prodSpecCharValueUse = characteristics;

    if (!selected) return result;
    return Object.fromEntries(
      selected
        .filter((field) => result[field] !== undefined)
        .map((field) => [field, result[field]]),
    );
  }

  async function getBbPackagesInterim({ query = {} }) {
    const allowed = new Set([
      "packageType",
      "packageGroup",
      "fields",
      "offset",
      "limit",
    ]);
    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Unsupported ProductOffering filter.");
    }

    if (
      typeof query.packageType !== "string" ||
      !query.packageType.trim() ||
      query.packageType !== query.packageType.trim() ||
      query.packageType.length > 64
    ) {
      throw fail(400, "packageType must be a trimmed, nonempty string.");
    }

    const filter = {
      offeringType: "broadbandPackage",
      packageType: query.packageType,
    };
    if (query.packageGroup !== undefined) {
      if (
        typeof query.packageGroup !== "string" ||
        !["Standard", "Any", "Unlimited"].includes(query.packageGroup)
      ) {
        throw fail(400, "packageGroup must be Standard, Any or Unlimited.");
      }
      filter.packageGroup = query.packageGroup;
    }

    const selected = selectedFields(query.fields);
    const offset = nonnegativeInteger(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = nonnegativeInteger(query.limit, 100, 1000);
    const total = await ProductOffering.countDocuments(filter);
    if (limit === 0) return { offerings: [], total };

    const rows = await ProductOffering.find(filter)
      .sort({ tier: 1, _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return { offerings: rows.map((row) => represent(row, selected)), total };
  }

  return { getBbPackagesInterim };
}

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTBroadbandOffering",
  type: "object",
  required: ["id", "href", "name", "packageType", "packageId", "@type"],
  properties: {
    packageType: { type: "string" },
    packageGroup: { enum: ["Standard", "Any", "Unlimited"] },
    packageId: { type: "string" },
    "@type": { const: "SLTBroadbandOffering" },
    "@baseType": { const: "ProductOffering" },
  },
};

module.exports = { createGetBbPackagesInterimService, extensionSchema };
