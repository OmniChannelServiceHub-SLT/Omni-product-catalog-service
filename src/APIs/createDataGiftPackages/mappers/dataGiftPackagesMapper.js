// Mapper for createDataGiftPackages - self-contained, no shared folder
// outside APIs/ per the team's file structure rule. Exports both response
// shapes off the same data.
// NOTE: no real legacy sample response existed in the source sheet for this
// one (sheet "57" was blank) - the legacy shape here mirrors the sibling
// catalog API listAdvancedReportingPackage (A49), which IS documented.

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
      productOfferingPrice: toCharacteristics({
        prePrice: offering.prePrice,
        postPrice: offering.postPrice,
        taxValue: offering.taxValue,
      }),
    },
  });
}

function toTmfResponse(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

function toLegacyResponse(offerings) {
  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      packages: offerings.map((o) => ({
        packageid: o.packageId,
        packagename: o.name,
        packageinfo: o.description,
        preprice: o.prePrice,
        postprice: o.postPrice,
        taxvalue: o.taxValue,
      })),
    },
    errorShow: null,
    errorCode: null,
  };
}

module.exports = { toTmfResponse, toLegacyResponse };
