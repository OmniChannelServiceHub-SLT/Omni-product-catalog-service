"use strict";

function fail(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function createGetDashboardVasService({ Product, getAuthorizedSubscriberIds }) {
  if (!Product || typeof Product.findOne !== "function") {
    throw new TypeError("Supply your existing TMF637_product model.");
  }

  if (typeof getAuthorizedSubscriberIds !== "function") {
    throw new TypeError("getAuthorizedSubscriberIds is required.");
  }

  return async function getDashboardVas({ query = {}, user }) {
    if (!user || typeof user !== "object") {
      throw fail(401, "Authentication is required.");
    }

    if (Object.keys(query).some((key) => key !== "subscriberID")) {
      throw fail(400, "Only subscriberID is supported.");
    }

    const subscriberId = query.subscriberID;

    if (
      typeof subscriberId !== "string" ||
      !subscriberId.trim() ||
      subscriberId !== subscriberId.trim() ||
      subscriberId.length > 128
    ) {
      throw fail(
        400,
        "subscriberID must be a nonempty string of at most 128 characters.",
      );
    }

    // Access must come from a server-side account lookup.
    const authorizedIds = await getAuthorizedSubscriberIds(user);

    if (
      !Array.isArray(authorizedIds) ||
      authorizedIds.some((id) => typeof id !== "string" || !id)
    ) {
      throw new Error("Account policy must return an array of subscriber IDs.");
    }

    if (!authorizedIds.includes(subscriberId)) {
      throw fail(403, "Access to this subscriber is denied.");
    }

    const snapshot = await Product.findOne({
      kind: "vasDashboard",
      subscriberId,
    }).lean();

    if (!snapshot) {
      throw fail(404, "VAS dashboard snapshot not found.");
    }

    // Explicit projection avoids exposing MongoDB internals
    // or unrelated fields from the shared model.
    return {
      subscriberId: snapshot.subscriberId,
      packageName: snapshot.packageName ?? null,
      summary: {
        limit: snapshot.summaryLimit ?? null,
        used: snapshot.summaryUsed ?? null,
        volumeUnit: snapshot.summaryVolumeUnit ?? null,
      },
      usageDetails: (snapshot.usageDetails ?? []).map((detail) => ({
        name: detail.name,
        limit: detail.limit ?? null,
        remaining: detail.remaining ?? null,
        used: detail.used ?? null,
        percentage: detail.percentage ?? null,
        volumeUnit: detail.volumeUnit ?? null,
        expiryDate: detail.expiryDate ?? null,
        claim: detail.claim ?? null,
        unsubscribable: detail.unsubscribable ?? false,
        timestamp: detail.timestamp ?? null,
        subscriptionId: detail.subscriptionId ?? null,
      })),
      reportedTime: snapshot.reportedTime ?? null,
    };
  };
}

module.exports = {
  createGetDashboardVasService,
};
