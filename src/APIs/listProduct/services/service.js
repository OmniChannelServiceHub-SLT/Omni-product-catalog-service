"use strict";

const FIELDS = new Set([
  "id",
  "href",
  "name",
  "description",
  "isBundle",
  "isCustomerVisible",
  "orderDate",
  "productSerialNumber",
  "startDate",
  "terminationDate",
  "productCharacteristic",
  "productOffering",
  "relatedParty",
  "status",
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
    throw fail(400, "Unsupported first-level Product field.");
  }
  return [...new Set(["id", "href", ...selected])];
}

function createListProductService({
  Product,
  getAuthorizedSubscriberIds,
  publicBaseUrl,
}) {
  if (
    !Product ||
    typeof Product.find !== "function" ||
    typeof Product.countDocuments !== "function"
  ) {
    throw new TypeError("Supply the TMF637 Product model.");
  }
  if (typeof getAuthorizedSubscriberIds !== "function") {
    throw new TypeError("getAuthorizedSubscriberIds must be a function.");
  }

  const base = new URL(publicBaseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new TypeError("publicBaseUrl must be a trusted HTTP(S) URL.");
  }
  const inventoryBase =
    base.href.replace(/\/$/, "") + "/tmf-api/productInventory/v4";
  const catalogBase =
    base.href.replace(/\/$/, "") + "/tmf-api/productCatalogManagement/v4";

  function represent(record, selected) {
    const id = record?.id || (record?._id && String(record._id));
    if (
      typeof id !== "string" ||
      !id ||
      typeof record.productOfferingId !== "string" ||
      !record.productOfferingId
    ) {
      throw new Error("Stored purchased product is incomplete.");
    }

    const result = {
      id,
      href: `${inventoryBase}/product/${encodeURIComponent(id)}`,
      name:
        typeof record.productOfferingName === "string"
          ? record.productOfferingName
          : record.packageName,
      isBundle: false,
      isCustomerVisible: true,
      status: typeof record.status === "string" ? record.status : "active",
      productOffering: {
        id: record.productOfferingId,
        href: `${catalogBase}/productOffering/${encodeURIComponent(record.productOfferingId)}`,
        name: record.productOfferingName,
        "@type": "ProductOfferingRef",
        "@referredType": "ProductOffering",
      },
      relatedParty: [
        {
          id: record.subscriberId,
          role: "subscriber",
          "@type": "RelatedParty",
          "@referredType": "Individual",
        },
      ],
      "@type": "Product",
    };

    if (!result.name) delete result.name;
    if (!result.productOffering.name) delete result.productOffering.name;
    for (const key of ["description", "orderDate", "startDate", "terminationDate"]) {
      if (record[key] !== undefined) result[key] = record[key];
    }

    if (!selected) return result;
    return Object.fromEntries(
      selected
        .filter((field) => result[field] !== undefined)
        .map((field) => [field, result[field]]),
    );
  }

  async function listProduct({ query = {}, user }) {
    if (!user || typeof user !== "object") {
      throw fail(401, "Authentication is required.");
    }
    const allowed = new Set([
      "productType",
      "subscriberId",
      "status",
      "fields",
      "offset",
      "limit",
    ]);
    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(400, "Unsupported Product filter.");
    }
    if (query.productType !== "peoVasSubscription") {
      throw fail(400, "productType must be peoVasSubscription.");
    }
    if (
      typeof query.subscriberId !== "string" ||
      !query.subscriberId.trim() ||
      query.subscriberId !== query.subscriberId.trim() ||
      query.subscriberId.length > 128
    ) {
      throw fail(400, "subscriberId must be a trimmed, nonempty string.");
    }
    if (
      query.status !== undefined &&
      (typeof query.status !== "string" || !query.status.trim())
    ) {
      throw fail(400, "status must be a nonempty string.");
    }

    const authorizedIds = await getAuthorizedSubscriberIds(user);
    if (
      !Array.isArray(authorizedIds) ||
      authorizedIds.some((id) => typeof id !== "string" || !id)
    ) {
      throw new Error("Account-access policy must return subscriber ID strings.");
    }
    if (!authorizedIds.includes(query.subscriberId)) {
      throw fail(403, "Access to this subscriber is denied.");
    }

    const filter = {
      kind: "peoPurchasedProduct",
      subscriberId: query.subscriberId,
    };
    if (query.status !== undefined) filter.status = query.status;

    const selected = fieldSelection(query.fields);
    const offset = pageValue(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = pageValue(query.limit, 100, 1000);
    const total = await Product.countDocuments(filter);
    if (limit === 0) return { products: [], total };

    const rows = await Product.find(filter)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return { products: rows.map((row) => represent(row, selected)), total };
  }

  return { listProduct };
}

module.exports = { createListProductService };
