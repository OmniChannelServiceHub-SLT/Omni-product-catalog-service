"use strict";

const FIELDS = new Set([
  "id", "href", "name", "description", "lastUpdate", "lifecycleStatus",
  "attachment", "category", "productOfferingPrice", "prodSpecCharValueUse",
  "offeringType", "packageId", "@baseType", "@schemaLocation", "@type",
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

function characteristic(name, value, valueType) {
  return {
    name,
    valueType,
    minCardinality: 1,
    maxCardinality: 1,
    productSpecCharacteristicValue: [
      { value, "@type": "ProductSpecificationCharacteristicValue" },
    ],
    "@type": "ProductSpecificationCharacteristicValueUse",
  };
}

function numericPrice(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function createListOfferingVasService({ ProductOffering, publicBaseUrl }) {
  if (!ProductOffering || typeof ProductOffering.find !== "function" || typeof ProductOffering.countDocuments !== "function") {
    throw new TypeError("Supply the TMF620 ProductOffering model.");
  }
  const base = new URL(publicBaseUrl);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new TypeError("BASE_URL must be a trusted HTTP(S) origin/deployment prefix.");
  }
  const apiBase = base.href.replace(/\/$/, "") + "/tmf-api/productCatalogManagement/v4";

  function represent(record, selected) {
    const id = record?._id && String(record._id);
    if (!id || typeof record.name !== "string" || typeof record.packageId !== "string") {
      throw new Error("Stored VAS offering is incomplete.");
    }
    const result = {
      id,
      href: `${apiBase}/productOffering/${encodeURIComponent(id)}`,
      name: record.name,
      lifecycleStatus: "Active",
      offeringType: "vasAddon",
      packageId: record.packageId,
      "@type": "SLTVasProductOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": `${apiBase}/schemas/SLTVasProductOffering.schema.json`,
    };
    if (typeof record.description === "string") result.description = record.description;
    if (typeof record.category === "string") {
      result.category = [{ id: record.category, name: record.category, "@type": "CategoryRef", "@referredType": "Category" }];
    }
    if (typeof record.iconUrl === "string") {
      result.attachment = [{ url: record.iconUrl, attachmentType: "icon", name: `${record.name} icon`, "@type": "Attachment" }];
    }
    if (record.updatedAt) {
      const updated = new Date(record.updatedAt);
      if (!Number.isFinite(updated.getTime())) throw new Error("Stored offering has an invalid update time.");
      result.lastUpdate = updated.toISOString();
    }

    const prices = [];
    for (const [name, key, allowedKey] of [
      ["Prepaid price", "prePrice", "prePaidAllowed"],
      ["Postpaid price", "postPrice", "postPaidAllowed"],
    ]) {
      const value = numericPrice(record[key]);
      if (value === null || record[allowedKey] === false) continue;
      prices.push({
        name,
        priceType: record.recurring ? "recurring" : "oneTime",
        ...(record.recurring ? { recurringChargePeriod: "month" } : {}),
        price: { unit: "LKR", value },
        "@type": "ProductOfferingPrice",
      });
    }
    if (prices.length) result.productOfferingPrice = prices;

    const characteristics = [];
    for (const [name, key] of [
      ["payable", "payable"],
      ["prePaidAllowed", "prePaidAllowed"],
      ["postPaidAllowed", "postPaidAllowed"],
      ["recurring", "recurring"],
    ]) {
      if (typeof record[key] === "boolean") characteristics.push(characteristic(name, record[key], "boolean"));
    }
    for (const [name, key] of [
      ["prePaidTax", "prePaidTax"],
      ["postPaidTax", "postPaidTax"],
      ["colorCode", "colorCode"],
    ]) {
      if (typeof record[key] === "string") characteristics.push(characteristic(name, record[key], "string"));
    }
    if (characteristics.length) result.prodSpecCharValueUse = characteristics;

    if (!selected) return result;
    return Object.fromEntries(selected.filter((field) => result[field] !== undefined).map((field) => [field, result[field]]));
  }

  async function listOfferingVas({ query = {} }) {
    const allowed = new Set(["offeringType", "category", "name", "packageId", "fields", "offset", "limit"]);
    if (Object.keys(query).some((key) => !allowed.has(key))) throw fail(400, "Unsupported ProductOffering filter.");
    if (query.offeringType !== "vasAddon") throw fail(400, "offeringType must be vasAddon.");

    const filter = { offeringType: "vasAddon" };
    for (const key of ["category", "name", "packageId"]) {
      const value = query[key];
      if (value === undefined) continue;
      if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > 256) {
        throw fail(400, `${key} must be a trimmed, nonempty string.`);
      }
      filter[key] = value;
    }
    const selected = fieldSelection(query.fields);
    const offset = pageValue(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = pageValue(query.limit, 100, 1000);
    const total = await ProductOffering.countDocuments(filter);
    if (limit === 0) return { offerings: [], total };
    const rows = await ProductOffering.find(filter).sort({ tier: 1, _id: 1 }).skip(offset).limit(limit).lean();
    return { offerings: rows.map((row) => represent(row, selected)), total };
  }

  return { listOfferingVas };
}

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTVasProductOffering",
  type: "object",
  required: ["id", "href", "name", "offeringType", "packageId", "@type"],
  properties: {
    offeringType: { const: "vasAddon" },
    packageId: { type: "string" },
    "@type": { const: "SLTVasProductOffering" },
    "@baseType": { const: "ProductOffering" },
  },
};

module.exports = { createListOfferingVasService, extensionSchema };
