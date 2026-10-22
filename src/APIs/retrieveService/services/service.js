"use strict";

const FIELDS = new Set([
  "id",
  "href",
  "category",
  "description",
  "endDate",
  "hasStarted",
  "isBundle",
  "isServiceEnabled",
  "isStateful",
  "name",
  "serviceDate",
  "serviceType",
  "startDate",
  "startMode",
  "feature",
  "note",
  "place",
  "relatedEntity",
  "relatedParty",
  "serviceCharacteristic",
  "serviceOrderItem",
  "serviceRelationship",
  "serviceSpecification",
  "state",
  "supportingResource",
  "supportingService",
  "@type",
  "@baseType",
  "@schemaLocation",
]);

const STATES = new Set([
  "feasibilityChecked",
  "designed",
  "reserved",
  "inactive",
  "active",
  "terminated",
]);

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function createRetrieveServiceService({
  ServiceModel,
  authorizeService,
  publicBaseUrl,
}) {
  if (!ServiceModel || typeof ServiceModel.findOne !== "function") {
    throw new TypeError(
      "Supply a TMF638 ServiceModel exposing findOne({ id }).",
    );
  }

  if (typeof authorizeService !== "function") {
    throw new TypeError("Supply authorizeService(user, service).");
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

  const resourceBase =
    base.href.replace(/\/$/, "") + "/tmf-api/serviceInventory/v4/service/";

  return async function retrieveService({ id, query = {}, user }) {
    if (!user || typeof user !== "object" || Array.isArray(user)) {
      throw fail(401, "Authentication is required.");
    }

    if (typeof id !== "string" || !id.trim()) {
      throw fail(400, "A service id is required.");
    }

    if (Object.keys(query).some((key) => key !== "fields")) {
      throw fail(400, "Only fields is supported on service ID retrieval.");
    }

    let selected = null;

    if (query.fields !== undefined) {
      if (typeof query.fields !== "string") {
        throw fail(400, "fields must be a comma-separated string.");
      }

      selected = query.fields.split(",").map((field) => field.trim());

      if (selected.some((field) => !FIELDS.has(field))) {
        throw fail(400, "Invalid first-level Service field.");
      }
    }

    // Public TMF service ID, not an assumed MongoDB ObjectId.
    const record = await ServiceModel.findOne({ id });

    if (!record) {
      throw fail(404, "Service not found.");
    }

    const stored =
      typeof record.toObject === "function" ? record.toObject() : record;

    // Check ownership, operator permissions and service visibility.
    if ((await authorizeService(user, stored)) !== true) {
      throw fail(403, "Access to this service is denied.");
    }

    if (stored.id !== id) {
      throw new Error(
        "Stored service id does not match the requested identifier.",
      );
    }

    if (stored.state !== undefined && !STATES.has(stored.state)) {
      throw new Error(
        "Stored service has an invalid TMF638 v4 lifecycle state.",
      );
    }

    const service = Object.fromEntries(
      [...FIELDS]
        .filter(
          (key) =>
            Object.prototype.hasOwnProperty.call(stored, key) &&
            stored[key] !== undefined,
        )
        .map((key) => [key, stored[key]]),
    );

    service.id = id;
    service.href = resourceBase + encodeURIComponent(id);

    // Normalize actual Date objects without inventing values.
    for (const key of ["endDate", "serviceDate", "startDate"]) {
      if (service[key] instanceof Date) {
        service[key] = service[key].toISOString();
      }
    }

    if (!selected) return service;

    return Object.fromEntries(
      [...new Set(["id", "href", ...selected])]
        .filter((key) => service[key] !== undefined)
        .map((key) => [key, service[key]]),
    );
  };
}

module.exports = { createRetrieveServiceService };
