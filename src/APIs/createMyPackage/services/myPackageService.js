// Row 142 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "MyPackage" (GET), log seq A48
const SubscriberUsageSnapshot = require('../../../models/SubscriberUsageSnapshot');

async function createMyPackage(subscriberId) {
  const snapshot = await SubscriberUsageSnapshot.findOne({ kind: 'myPackage', subscriberId });
  if (!snapshot) return null;

  // Matches real dataBundle shape from API_Params_SLTOMNI_V2_0_1.xlsx sheet "48":
  // dataBundle.package_name / package_summary / usageDetails[] / reported_time
  return {
    package_name: snapshot.packageName,
    package_summary: {
      limit: snapshot.summaryLimit,
      used: snapshot.summaryUsed,
      volume_unit: snapshot.summaryVolumeUnit,
    },
    usageDetails: snapshot.usageDetails.map((d) => ({
      name: d.name,
      limit: d.limit,
      remaining: d.remaining,
      used: d.used,
      percentage: d.percentage,
      volume_unit: d.volumeUnit,
      expiry_date: d.expiryDate,
      claim: d.claim,
      unsubscribable: d.unsubscribable,
      timestamp: d.timestamp,
      subscriptionid: d.subscriptionId,
    })),
    reported_time: snapshot.reportedTime,
  };
}

module.exports = { createMyPackage };
