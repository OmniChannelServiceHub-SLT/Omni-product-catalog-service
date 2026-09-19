// Mapper for listVASDataBundlePackages - self-contained, no shared folder
// outside APIs/ per the team's file structure rule.

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

function mapOfferingToResource(offering) {
  return buildResource({
    id: offering.packageId,
    type: 'ProductOffering',
    extra: {
      name: offering.name,
      description: offering.description,
      ...(offering.category ? { category: { name: offering.category } } : {}),
      productOfferingPrice: toCharacteristics({
        prePrice: offering.prePrice,
        postPrice: offering.postPrice,
        taxValue: offering.taxValue,
      }),
      productOfferingCharacteristic: toCharacteristics({
        payable: offering.payable,
        prePaidAllowed: offering.prePaidAllowed,
        postPaidAllowed: offering.postPaidAllowed,
        iconUrl: offering.iconUrl,
        colorCode: offering.colorCode,
      }),
    },
  });
}

function mapVASDataBundlePackages(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

module.exports = { mapVASDataBundlePackages };
