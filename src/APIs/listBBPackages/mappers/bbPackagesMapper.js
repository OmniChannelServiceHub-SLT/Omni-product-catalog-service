// Mapper for listBBPackages - self-contained, no shared folder outside APIs/
// per the team's file structure rule.

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

function mapOfferingToResource(offering, extraCharacteristics = {}) {
  return buildResource({
    id: offering.packageId,
    type: 'ProductOffering',
    extra: {
      name: offering.name,
      productOfferingCharacteristic: toCharacteristics(extraCharacteristics),
    },
  });
}

function mapBBPackages({ upgrades, downgrades }) {
  return [
    ...upgrades.map((o) => mapOfferingToResource(o, { relation: 'upgrade' })),
    ...downgrades.map((o) => mapOfferingToResource(o, { relation: 'downgrade' })),
  ];
}

module.exports = { mapBBPackages };
