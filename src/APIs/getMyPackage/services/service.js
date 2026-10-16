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
  "agreement",
  "billingAccount",
  "place",
  "product",
  "productCharacteristic",
  "productOffering",
  "productOrderItem",
  "productPrice",
  "productRelationship",
  "productSpecification",
  "productTerm",
  "realizingResource",
  "realizingService",
  "relatedParty",
  "status",
  "@baseType",
  "@schemaLocation",
  "@type",
]);

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function integer(value, fallback, maximum) {
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

function createGetMyPackageService({
  Product,
  getAuthorizedSubscriberIds,
  publicBaseUrl,
}) {
  if (
    !Product ||
    typeof Product.find !== "function" ||
    typeof Product.countDocuments !== "function"
  ) {
    throw new TypeError("Supply your existing TMF637_product model.");
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

  const resourceBase =
    base.href.replace(/\/$/, "") + "/tmf-api/productInventory/v4/product/";

  return async function getMyPackage({ query = {}, user }) {
    if (!user || typeof user !== "object") {
      throw fail(401, "Authentication is required.");
    }

    const allowed = new Set(["subscriberID", "fields", "offset", "limit"]);

    if (Object.keys(query).some((key) => !allowed.has(key))) {
      throw fail(
        400,
        "Supported query parameters: subscriberID, fields, offset, limit.",
      );
    }

    const offset = integer(query.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = integer(query.limit, 100, 1000);

    let selected = null;

    if (query.fields !== undefined) {
      if (typeof query.fields !== "string") {
        throw fail(400, "fields must be a comma-separated string.");
      }

      selected = query.fields.split(",").map((field) => field.trim());

      if (selected.some((field) => !FIELDS.has(field))) {
        throw fail(400, "Invalid first-level Product field.");
      }
    }

    const subscriberID = query.subscriberID;

    if (
      subscriberID !== undefined &&
      (typeof subscriberID !== "string" ||
        !subscriberID.trim() ||
        subscriberID.length > 128)
    ) {
      throw fail(400, "subscriberID must be a nonempty string.");
    }

    const ids = await getAuthorizedSubscriberIds(user);

    if (
      !Array.isArray(ids) ||
      ids.some((id) => typeof id !== "string" || !id)
    ) {
      throw new Error(
        "Account-access policy must return subscriber ID strings.",
      );
    }

    if (subscriberID !== undefined && !ids.includes(subscriberID)) {
      throw fail(403, "Access to this subscriber is denied.");
    }

    if (!ids.length) {
      return { products: [], total: 0 };
    }

    const filter = {
      kind: "myPackage",
      subscriberId:
        subscriberID === undefined ? { $in: [...new Set(ids)] } : subscriberID,
    };

    const total = await Product.countDocuments(filter);

    if (limit === 0) {
      return { products: [], total };
    }

    const records = await Product.find(filter)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const products = records.map((record) => {
      const id = record.id || (record._id && String(record._id));

      if (typeof id !== "string" || !id) {
        throw new Error("Stored package has no stable identifier.");
      }

      const product = Object.fromEntries(
        [...FIELDS]
          .filter((key) => record[key] !== undefined)
          .map((key) => [key, record[key]]),
      );

      product.id = id;
      product.href = resourceBase + encodeURIComponent(id);
      product["@type"] = record["@type"] || "Product";

      if (
        product.name === undefined &&
        typeof record.packageName === "string"
      ) {
        product.name = record.packageName;
      }

      const characteristics = Array.isArray(record.productCharacteristic)
        ? [...record.productCharacteristic]
        : [];

      const snapshotFields = [
        "kind",
        "subscriberId",
        "summaryLimit",
        "summaryUsed",
        "summaryVolumeUnit",
        "usageDetails",
        "reportedTime",
      ];

      for (const key of snapshotFields) {
        if (
          record[key] !== undefined &&
          record[key] !== null &&
          !characteristics.some((item) => item.name === key)
        ) {
          characteristics.push({
            name: key,
            valueType: typeof record[key] === "string" ? "string" : "object",
            value: record[key],
          });
        }
      }

      if (characteristics.length) {
        product.productCharacteristic = characteristics;
      }

      if (!selected) return product;

      return Object.fromEntries(
        [...new Set(["id", "href", ...selected])]
          .filter((key) => product[key] !== undefined)
          .map((key) => [key, product[key]]),
      );
    });

    return { products, total };
  };
}

module.exports = { createGetMyPackageService };
module.exports = { createGetMyPackageService };
