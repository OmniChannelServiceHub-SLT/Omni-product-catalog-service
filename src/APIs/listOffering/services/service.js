"use strict";

const FIELDS = new Set([
  "id",
  "href",
  "name",
  "lastUpdate",
  "lifecycleStatus",
  "offeringType",
  "packageId",
  "category",
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

function createListOfferingService({ ProductOffering, publicBaseUrl }) {
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
    if (!id || typeof record.name !== "string" || typeof record.packageId !== "string") {
      throw new Error("Stored PEO VAS offering is incomplete.");
    }

    const result = {
      id,
      href: `${apiBase}/productOffering/${encodeURIComponent(id)}`,
      name: record.name,
      lifecycleStatus: "Active",
      offeringType: "peoVasProduct",
      packageId: record.packageId,
      "@type": "SLTPeoVasProductOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": `${apiBase}/schemas/SLTPeoVasProductOffering.schema.json`,
    };

    if (typeof record.category === "string") {
      result.category = [
        {
          id: "PEO-TV-VAS",
          name: record.category,
          "@type": "CategoryRef",
          "@referredType": "Category",
        },
      ];
    }
    if (record.updatedAt) {
      const updated = new Date(record.updatedAt);
      if (!Number.isFinite(updated.getTime())) {
        throw new Error("Stored offering has an invalid update time.");
      }
      result.lastUpdate = updated.toISOString();
    }

    if (!selected) return result;
    return Object.fromEntries(
      selected
        .filter((field) => result[field] !== undefined)
        .map((field) => [field, result[field]]),
    );
  }

  async function listOffering({ query = {} }) {
    const allowed = new Set([
      "offeringType",
      "name",
      "packageId",
      "fields",
      "offset",
      "limit",
    ]);
    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Unsupported ProductOffering filter.");
    }
    if (query.offeringType !== "peoVasProduct") {
      throw fail(400, "offeringType must be peoVasProduct.");
    }

    const filter = { offeringType: "peoVasProduct" };
    for (const key of ["name", "packageId"]) {
      const value = query[key];
      if (value === undefined) continue;
      if (
        typeof value !== "string" ||
        !value.trim() ||
        value !== value.trim() ||
        value.length > 256
      ) {
        throw fail(400, `${key} must be a trimmed, nonempty string.`);
      }
      filter[key] = value;
    }

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

  return { listOffering };
}

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTPeoVasProductOffering",
  type: "object",
  required: ["id", "href", "name", "offeringType", "packageId", "@type"],
  properties: {
    offeringType: { const: "peoVasProduct" },
    packageId: { type: "string" },
    "@type": { const: "SLTPeoVasProductOffering" },
    "@baseType": { const: "ProductOffering" },
  },
};

module.exports = { createListOfferingService, extensionSchema };
