// Mapper for listBBPackageDetails - self-contained, no shared folder outside
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

function toTmfResponse(offering) {
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

// Rebuilds the exact original MySLT GetBBPackageDetails shape (sheet "76") -
// legacy dataBundle was an ARRAY with one entry.
function toLegacyResponse(offering) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: [
      {
        BB_PACKAGE_CODE: offering.packageId,
        BB_PACKAGE_NAME: offering.name,
        MONTHLY_RENTAL: offering.monthlyRental != null ? offering.monthlyRental.toFixed(2) : null,
        STANDARD_GB: offering.standardGB != null ? String(offering.standardGB) : null,
        FREE_GB: offering.freeGB != null ? String(offering.freeGB) : null,
      },
    ],
    errorShow: null,
    errorCode: null,
  };
}

module.exports = { toTmfResponse, toLegacyResponse };
