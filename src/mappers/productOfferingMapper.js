// Shared mapper: turns a TMF620_ProductOffering document into the TMF-aligned
// API response shape. All 5 catalog APIs (VAS addons, BB packages, BB package
// details, data gift x2, advanced reporting) call this one function.
const { toCharacteristics, buildResource } = require('./tmfMapper');

function mapOfferingToResource(offering, extraCharacteristics = {}) {
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
        monthlyRental: offering.monthlyRental,
      }),
      productOfferingCharacteristic: toCharacteristics({
        payable: offering.payable,
        prePaidAllowed: offering.prePaidAllowed,
        postPaidAllowed: offering.postPaidAllowed,
        iconUrl: offering.iconUrl,
        colorCode: offering.colorCode,
        standardGB: offering.standardGB,
        freeGB: offering.freeGB,
        ...extraCharacteristics,
      }),
    },
  });
}

module.exports = { mapOfferingToResource };
