// Mapper for createMyPackage - self-contained, no shared folder outside
// APIs/ per the team's file structure rule.

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

function mapMyPackage(snapshot) {
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

module.exports = { mapMyPackage };
