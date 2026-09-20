// Mapper for createMyPackage - self-contained, no shared folder outside
// APIs/ per the team's file structure rule. Exports both response shapes off
// the same data.

function toCharacteristics(obj) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ({ name, value }));
}

function buildResource({ id, type, baseType, extra = {} }) {
  return {
    id,
    href: `/${type.charAt(0).toLowerCase()}${type.slice(1)}/${id}`,
    '@type': type,
    '@baseType': baseType || type,
    ...extra,
  };
}

function toTmfResponse(snapshot) {
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

// Rebuilds the exact original MySLT MyPackage shape (sheet "48").
function toLegacyResponse(snapshot) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
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
    },
    errorShow: null,
    errorCode: null,
  };
}

module.exports = { toTmfResponse, toLegacyResponse };
