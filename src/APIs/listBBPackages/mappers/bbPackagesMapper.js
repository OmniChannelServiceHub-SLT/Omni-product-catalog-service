// Mapper for listBBPackages - self-contained, no shared folder outside APIs/
// per the team's file structure rule. Exports both response shapes off the
// same data.

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

function toTmfResponse({ upgrades, downgrades }) {
  return [
    ...upgrades.map((o) => mapOfferingToResource(o, { relation: 'upgrade' })),
    ...downgrades.map((o) => mapOfferingToResource(o, { relation: 'downgrade' })),
  ];
}

// Rebuilds the exact original MySLT GetBBPackages shape (sheet "75").
function toLegacyResponse({ upgrades, downgrades }) {
  const toEntry = (o) => ({ BB_PACKAGE_NAME: o.name, BB_PACKAGE_CODE: o.packageId });

  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      Upgrades: upgrades.map(toEntry),
      Downgrades: downgrades.map(toEntry),
    },
    errorShow: null,
    errorCode: null,
  };
}

module.exports = { toTmfResponse, toLegacyResponse };
