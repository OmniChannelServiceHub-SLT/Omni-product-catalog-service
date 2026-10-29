"use strict";

const { createHash } = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");

const PROVIDER_BASE = "https://omnitest.slt.com.lk/api/Voice/";
const ENABLED = "callForwardingEnabled";
const NUMBER = "callForwardingNumber";
const PUBLIC_FIELDS = [
  "id", "href", "@type", "name", "description",
  "serviceType", "state", "serviceCharacteristic",
];

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createPatchServiceService({
  ServiceModel,
  authorizeService,
  getLegacyAuthorization,
  publicBaseUrl,
  fetchImpl = globalThis.fetch,
  providerMode = "disabled",
  nodeEnv = process.env.NODE_ENV,
}) {
  if (
    !ServiceModel ||
    typeof ServiceModel.findOne !== "function" ||
    typeof ServiceModel.findOneAndUpdate !== "function" ||
    typeof ServiceModel.updateOne !== "function"
  ) throw new TypeError("Supply TMF638_service.");
  if (typeof authorizeService !== "function") {
    throw new TypeError("authorizeService is required.");
  }
  if (typeof getLegacyAuthorization !== "function") {
    throw new TypeError("getLegacyAuthorization is required.");
  }
  if (typeof fetchImpl !== "function") throw new TypeError("fetch is required.");

  if (!["mock", "legacy", "disabled"].includes(providerMode)) {
    throw new TypeError("VOICE_PROVIDER_MODE must be mock, legacy or disabled.");
  }
  if (providerMode === "mock" && nodeEnv !== "development") {
    throw new TypeError("Mock voice mode requires NODE_ENV=development.");
  }
  const base = new URL(publicBaseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username || base.password || base.search || base.hash
  ) throw new TypeError("BASE_URL must be a trusted HTTP(S) deployment URL.");

  const resourceBase = base.href.replace(/\/$/, "") +
    "/tmf-api/serviceInventory/v5/service/";

  function selectFields(query) {
    if (Object.keys(query).some((key) => key !== "fields")) {
      throw fail(400, "Only fields is supported.");
    }
    if (query.fields === undefined) return null;
    if (typeof query.fields !== "string") {
      throw fail(400, "fields must be a comma-separated string.");
    }
    const fields = query.fields.split(",").map((field) => field.trim());
    if (fields.some((field) => !PUBLIC_FIELDS.includes(field))) {
      throw fail(400, "Unsupported field for this voice-service profile.");
    }
    return [...new Set(["id", "href", "@type", ...fields])];
  }

  async function load(id, user) {
    if (!object(user)) throw fail(401, "Authentication is required.");
    if (typeof id !== "string" || !id.trim() || id.length > 128) {
      throw fail(400, "A valid service id is required.");
    }
    const service = await ServiceModel.findOne({ id })
      .select("+binding +forwardingRequest").lean();
    if (!service) throw fail(404, "Service not found.");
    if (await authorizeService(user, service) !== true) {
      throw fail(403, "Access to this service is denied.");
    }
    if (providerMode === "disabled") throw fail(503, "Voice provider is disabled.");
    if (service.binding?.environment !== providerMode) {
      throw fail(503, "Service binding does not match the configured provider mode.");
    }
    if (!/^\d{9,15}$/.test(service.binding?.telephoneNo || "")) {
      throw fail(503, "The service has no valid telephone binding.");
    }
    return service;
  }

  async function authorization() {
    const value = await getLegacyAuthorization();
    if (typeof value !== "string" || !value.trim() || /[\r\n]/.test(value)) {
      throw fail(503, "Legacy authentication is not configured.");
    }
    return value;
  }

  async function provider(path, parameters, auth, mutation = false) {
    const url = new URL(path, PROVIDER_BASE);
    for (const [key, value] of Object.entries(parameters)) {
      url.searchParams.set(key, value);
    }
    const signal = AbortSignal.timeout(10000);
    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: auth,
          // The legacy provider uses GET even for the mutation.
          "Cache-Control": "no-store",
        },
        redirect: "error",
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("Provider HTTP failure.");
      const data = await response.json();
      if (!object(data) || data.isSuccess !== true) {
        throw new Error("Provider reported a failure.");
      }
      return data;
    } catch {
      throw fail(
        503,
        mutation
          ? "Submission outcome could not be confirmed. Reconcile before resubmitting."
          : "Unable to read call-forwarding status.",
      );
    }
  }

  function desiredPatch(body, stored) {
    if (
      !object(body) || body["@type"] !== "Service" ||
      Object.keys(body).some(
        (key) => !["@type", "serviceCharacteristic"].includes(key),
      ) ||
      !Array.isArray(body.serviceCharacteristic)
    ) {
      throw fail(400, "Supply @type=Service and serviceCharacteristic.");
    }

    const incoming = body.serviceCharacteristic;
    if (
      incoming.some((item) => !object(item) || typeof item.name !== "string") ||
      new Set(incoming.map((item) => item.name)).size !== incoming.length
    ) throw fail(400, "Characteristics must have unique names.");

    // Array replacement semantics: preserve other characteristics unchanged.
    const unaffected = (items) => items.filter(
      (item) => ![ENABLED, NUMBER].includes(item.name),
    );
    if (!isDeepStrictEqual(
      unaffected(incoming),
      unaffected(stored.serviceCharacteristic || []),
    )) {
      throw fail(400, "Preserve other service characteristics unchanged.");
    }

    const enabled = incoming.find((item) => item.name === ENABLED);
    const number = incoming.find((item) => item.name === NUMBER);
    function typed(item, type, valueType) {
      return object(item) &&
        item["@type"] === type &&
        item.valueType === valueType &&
        Object.keys(item).every(
          (key) => ["name", "@type", "valueType", "value"].includes(key),
        );
    }

    if (
      !typed(enabled, "BooleanCharacteristic", "boolean") ||
      typeof enabled.value !== "boolean"
    ) throw fail(400, "callForwardingEnabled must be a BooleanCharacteristic.");

    // The documented legacy request requires mobileNo for Y and N.
    if (
      !typed(number, "StringCharacteristic", "string") ||
      typeof number.value !== "string" ||
      !/^\d{9,15}$/.test(number.value)
    ) throw fail(400, "callForwardingNumber must contain 9 to 15 digits.");

    return { enabled: enabled.value, number: number.value };
  }

  async function patchService({ id, query = {}, body, user }) {
    selectFields(query); // Validate before any side effect.
    const stored = await load(id, user);
    const desired = desiredPatch(body, stored);
    if (providerMode === "mock") {
      const updated = await ServiceModel.findOneAndUpdate(
        { id, __v: stored.__v, "binding.environment": "mock", forwardingRequest: { $exists: false } },
        { $set: { serviceCharacteristic: body.serviceCharacteristic }, $inc: { __v: 1 } },
        { new: true, runValidators: true },
      );
      if (!updated) throw fail(409, "Service changed; reload before retrying.");
      return { status: 200, href: resourceBase + encodeURIComponent(id),
        service: representation(updated.toObject ? updated.toObject() : updated, selectFields(query)) };
    }
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(desired)).digest("hex");
    const href = resourceBase + encodeURIComponent(id);

    if (stored.forwardingRequest) {
      if (
        stored.forwardingRequest.status === "accepted" &&
        stored.forwardingRequest.fingerprint === fingerprint
      ) return { status: 202, href };
      throw fail(409, "A previous forwarding request requires reconciliation.");
    }

    const auth = await authorization();
    // One request wins across processes; no automatic retry of mutations.
    const claimed = await ServiceModel.findOneAndUpdate(
      {
        id,
        __v: stored.__v,
        forwardingRequest: { $exists: false },
      },
      {
        $set: {
          forwardingRequest: {
            fingerprint,
            desiredEnabled: desired.enabled,
            desiredNumber: desired.number,
            status: "sending",
            requestedAt: new Date(),
          },
        },
        $inc: { __v: 1 },
      },
      { new: true, runValidators: true },
    );
    if (!claimed) throw fail(409, "The service changed; reload before retrying.");

    try {
      await provider(
        "CallForwardingRequest",
        {
          telephoneNo: stored.binding.telephoneNo,
          mobileNo: desired.number,
          requestType: desired.enabled ? "Y" : "N",
        },
        auth,
        true,
      );
    } catch (error) {
      try {
        await ServiceModel.updateOne(
          { id, "forwardingRequest.fingerprint": fingerprint },
          { $set: { "forwardingRequest.status": "unknown" } },
        );
      } catch {
        // A surviving "sending" gate also prevents duplicate submissions.
      }
      throw error;
    }

    try {
      const saved = await ServiceModel.updateOne(
        { id, "forwardingRequest.fingerprint": fingerprint },
        { $set: { "forwardingRequest.status": "accepted" } },
      );
      if (saved.matchedCount !== 1) throw new Error("Lost submission gate.");
    } catch {
      throw fail(503, "Request submitted; local recording failed. Reconcile before retrying.");
    }

    // Provider has acknowledged submission, not activation or the target.
    return { status: 202, href };
  }

  function representation(stored, fields) {
    const result = {
      id: stored.id,
      href: resourceBase + encodeURIComponent(stored.id),
      "@type": "Service",
    };
    for (const key of ["name", "description", "serviceType", "state"]) {
      if (stored[key] !== undefined) result[key] = stored[key];
    }
    result.serviceCharacteristic = stored.serviceCharacteristic || [];
    if (!fields) return result;
    return Object.fromEntries(fields.filter(key => result[key] !== undefined).map(key => [key, result[key]]));
  }

  async function retrieveService({ id, query = {}, user }) {
    const fields = selectFields(query);
    const stored = await load(id, user);
    if (providerMode === "mock") return representation(stored, fields);
    const auth = await authorization();
    const data = await provider(
      "CheckCallForwardingStatus",
      { telephoneNo: stored.binding.telephoneNo },
      auth,
    );
    const flag = data.dataBundle?.status;
    if (!["Y", "N"].includes(flag)) {
      throw fail(503, "The provider returned an invalid forwarding status.");
    }

    const result = representation(stored, null);
    result.serviceCharacteristic = [
      ...(stored.serviceCharacteristic || []).filter(
        (item) => ![ENABLED, NUMBER].includes(item.name),
      ),
      {
        "@type": "BooleanCharacteristic",
        name: ENABLED,
        valueType: "boolean",
        value: flag === "Y",
      },
    ];
    // Status provider does not expose the actual target number.
    if (!fields) return result;
    return Object.fromEntries(fields
      .filter((key) => result[key] !== undefined)
      .map((key) => [key, result[key]]));
  }

  return { patchService, retrieveService };
}

module.exports = { createPatchServiceService };
