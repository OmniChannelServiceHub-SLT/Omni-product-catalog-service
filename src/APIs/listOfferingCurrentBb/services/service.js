"use strict";

const ALLOWED_FIELDS = new Set([
  "id",
  "href",
  "name",
  "description",
  "lastUpdate",
  "lifecycleStatus",
  "productOfferingPrice",
  "prodSpecCharValueUse",
  "packageType",
  "packageId",
  "@baseType",
  "@schemaLocation",
  "@type",
]);

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function selectFields(fields) {
  if (fields === undefined) return null;
  if (typeof fields !== "string" || !fields.trim()) {
    throw fail(400, "fields must be a nonempty comma-separated string.");
  }

  const selected = fields.split(",").map((field) => field.trim());
  if (selected.some((field) => !ALLOWED_FIELDS.has(field))) {
    throw fail(400, "Unsupported first-level ProductOffering field.");
  }

  return [...new Set(["id", "href", ...selected])];
}

function exactCaseInsensitive(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

function characteristic(name, value, unitOfMeasure) {
  return {
    name,
    valueType: "number",
    minCardinality: 1,
    maxCardinality: 1,
    productSpecCharacteristicValue: [
      {
        value,
        unitOfMeasure,
        "@type": "ProductSpecificationCharacteristicValue",
      },
    ],
    "@type": "ProductSpecificationCharacteristicValueUse",
  };
}

function createListOfferingCurrentBbService({ ProductOffering, publicBaseUrl }) {
  if (!ProductOffering || typeof ProductOffering.findOne !== "function") {
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
      "@type": "SLTCurrentBroadbandOffering",
      "@baseType": "ProductOffering",
      "@schemaLocation": `${apiBase}/schemas/SLTCurrentBroadbandOffering.schema.json`,
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
      characteristics.push(characteristic("standardDataAllowance", record.standardGB, "GB"));
    }
    if (Number.isFinite(record.freeGB)) {
      characteristics.push(characteristic("freeDataAllowance", record.freeGB, "GB"));
    }
    if (characteristics.length) result.prodSpecCharValueUse = characteristics;

    if (!selected) return result;
    return Object.fromEntries(
      selected
        .filter((field) => result[field] !== undefined)
        .map((field) => [field, result[field]]),
    );
  }

  async function listOfferingCurrentBb({ query = {} }) {
    const allowed = new Set(["packageType", "name", "fields"]);
    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Only packageType, name and fields filters are supported.");
    }

    const { packageType, name } = query;
    for (const [key, value] of Object.entries({ packageType, name })) {
      if (
        typeof value !== "string" ||
        !value.trim() ||
        value !== value.trim() ||
        value.length > 128
      ) {
        throw fail(400, `${key} must be a trimmed, nonempty string.`);
      }
    }

    const selected = selectFields(query.fields);
    const record = await ProductOffering.findOne({
      offeringType: "broadbandPackage",
      packageType: exactCaseInsensitive(packageType),
      name: exactCaseInsensitive(name),
    }).lean();

    return record ? [represent(record, selected)] : [];
  }

  return { listOfferingCurrentBb };
}

const extensionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SLTCurrentBroadbandOffering",
  type: "object",
  required: ["id", "href", "name", "packageType", "packageId", "@type"],
  properties: {
    packageType: { type: "string" },
    packageId: { type: "string" },
    "@type": { const: "SLTCurrentBroadbandOffering" },
    "@baseType": { const: "ProductOffering" },
  },
};

module.exports = { createListOfferingCurrentBbService, extensionSchema };
