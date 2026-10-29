"use strict";

const LEGACY_URL =
  "https://omnitest.slt.com.lk/api/BBExternal/GetBBFreedomStatus";

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function createListProductOrderBbService({
  authorizeTelephone,
  getLegacyAuthorization,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof authorizeTelephone !== "function") {
    throw new TypeError("authorizeTelephone is required.");
  }

  if (typeof getLegacyAuthorization !== "function") {
    throw new TypeError("getLegacyAuthorization is required.");
  }

  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  return async function listProductOrderBb({ query = {}, user }) {
    if (!user || typeof user !== "object") {
      throw fail(401, "Authentication is required.");
    }

    if (Object.keys(query).some((key) => key !== "tpNo")) {
      throw fail(400, "Only the tpNo query parameter is supported.");
    }

    const { tpNo } = query;

    // Keep telephone numbers as strings to preserve leading zeros.
    if (typeof tpNo !== "string" || !/^\d{9,15}$/.test(tpNo)) {
      throw fail(400, "tpNo must contain 9 to 15 digits.");
    }

    const allowed = await authorizeTelephone(user, tpNo);

    if (allowed !== true) {
      throw fail(403, "Access to this telephone number is denied.");
    }
    // Development-only mock: no legacy API call is made.
    if (process.env.BB_FREEDOM_MODE === "mock") {
      if (process.env.NODE_ENV !== "development" || tpNo !== "0000000000") {
        throw fail(403, "Mock access is restricted to the test telephone.");
      }

      return {
        telephoneNumber: tpNo,
        freedomRequested: true,
        message: "Synthetic local mock response; no SLT API was called.",
      };
    }

    // Credentials for the legacy API are obtained server-side.
    const authorization = await getLegacyAuthorization();

    if (
      typeof authorization !== "string" ||
      !authorization.trim() ||
      /[\r\n]/.test(authorization)
    ) {
      throw fail(503, "Legacy API authentication is not configured.");
    }

    const url = new URL(LEGACY_URL);
    url.searchParams.set("tpNo", tpNo);

    const signal = AbortSignal.timeout(10000);
    let payload;

    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        signal,
        redirect: "error",
      });

      if (!response.ok) {
        throw fail(502, "The Freedom-status provider rejected the request.");
      }

      payload = await response.json();
    } catch (error) {
      if (signal.aborted) {
        throw fail(504, "The Freedom-status provider timed out.");
      }

      if (error.statusCode === 502) {
        throw error;
      }

      throw fail(502, "Unable to read the Freedom-status provider response.");
    }

    if (!payload || typeof payload !== "object" || payload.isSuccess !== true) {
      throw fail(502, "The Freedom-status provider reported a failure.");
    }

    const bundle = payload.dataBundle;

    if (!bundle || typeof bundle !== "object") {
      throw fail(502, "The Freedom-status provider returned invalid data.");
    }

    // Both spellings exist in the supplied legacy examples.
    const flags = [
      bundle["freedom requested"],
      bundle["freedom Requested"],
    ].filter((value) => value !== undefined);

    if (
      flags.length === 0 ||
      flags.some((value) => value !== "Y" && value !== "N") ||
      new Set(flags).size !== 1
    ) {
      throw fail(502, "The provider returned an invalid Freedom request flag.");
    }

    const message =
      typeof payload.errorShow === "string"
        ? payload.errorShow
        : typeof payload.errorMessege === "string"
          ? payload.errorMessege
          : null;

    return {
      telephoneNumber: tpNo,
      freedomRequested: flags[0] === "Y",
      message,
    };
  };
}

module.exports = {
  createListProductOrderBbService,
};
