// Mapper for listVASDataBundlePackages - self-contained, no shared folder
// outside APIs/ per the team's file structure rule.
// Exports both response shapes off the same data, matching the team's
// legacy/TMF dual-response pattern (see x-response-format header in the
// controller).

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

function toTmfResponse(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

// Rebuilds the exact original MySLT GetVASDataBundlePackages shape
// (API_Params_SLTOMNI sheet "A61") from the same underlying data.
function toLegacyResponse(offerings) {
  const grouped = new Map();
  for (const o of offerings) {
    if (!grouped.has(o.category)) grouped.set(o.category, []);
    grouped.get(o.category).push({
      id: Number(o.packageId),
      name: o.name,
      description: o.description,
      postprice: o.postPrice,
      preprice: o.prePrice,
      taxValue: o.taxValue,
      icon_url: o.iconUrl,
      color_code: o.colorCode,
      payable: o.payable,
      pre_paid_allowed: o.prePaidAllowed,
      post_paid_allowed: o.postPaidAllowed,
    });
  }

  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      categories: Array.from(grouped.entries()).map(([category, addons]) => ({ category, addons })),
    },
    errorShow: null,
    errorCode: null,
  };
}

module.exports = { toTmfResponse, toLegacyResponse };
