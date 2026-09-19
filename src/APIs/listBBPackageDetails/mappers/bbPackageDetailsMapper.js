// Mapper for listBBPackageDetails - self-contained, no shared folder outside
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

function mapBBPackageDetails(offering) {
  return buildResource({
    id: offering.packageId,
    type: 'ProductOffering',
    extra: {
      name: offering.name,
      productOfferingPrice: toCharacteristics({ monthlyRental: offering.monthlyRental }),
      productOfferingCharacteristic: toCharacteristics({
        standardGB: offering.standardGB,
        freeGB: offering.freeGB,
      }),
    },
  });
}

module.exports = { mapBBPackageDetails };
