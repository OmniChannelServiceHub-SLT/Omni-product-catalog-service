// Shared mapper: turns a TMF637_Product document (usage snapshot) into the
// TMF-aligned API response shape. Used by createMyPackage and
// listDashboardVASBundles.
const { toCharacteristics, buildResource } = require('./tmfMapper');

function mapUsageSnapshotToProduct(snapshot) {
  return buildResource({
    id: snapshot.subscriberId,
    type: 'Product',
    extra: {
      name: snapshot.packageName,
      status: 'active',
      productCharacteristic: toCharacteristics({
        summaryLimit: snapshot.summaryLimit,
        summaryUsed: snapshot.summaryUsed,
        summaryVolumeUnit: snapshot.summaryVolumeUnit,
        reportedTime: snapshot.reportedTime,
      }),
      // usageDetails don't have a fixed field in base TMF637 - this is a
      // documented BSS extension, one characteristic set per usage line.
      usageCharacteristic: snapshot.usageDetails.map((d) => ({
        name: d.name,
        value: toCharacteristics({
          limit: d.limit,
          remaining: d.remaining,
          used: d.used,
          percentage: d.percentage,
          volumeUnit: d.volumeUnit,
          expiryDate: d.expiryDate,
          claim: d.claim,
          unsubscribable: d.unsubscribable,
          timestamp: d.timestamp,
          subscriptionId: d.subscriptionId,
        }),
      })),
    },
  });
}

module.exports = { mapUsageSnapshotToProduct };
