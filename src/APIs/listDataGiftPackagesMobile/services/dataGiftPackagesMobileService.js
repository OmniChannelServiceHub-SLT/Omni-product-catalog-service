// Row 119 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetDataGiftPackagesMobile" (GET), log seq A65
// NOTE: no sample response captured in the source sheet for this one either -
// same "packages" catalog shape as createDataGiftPackages/listAdvancedReportingPackage.
const PackageCatalogItem = require('../../../models/PackageCatalogItem');

async function listDataGiftPackagesMobile() {
  const items = await PackageCatalogItem.find({ catalogType: 'dataGiftMobile' }).sort({ packageId: 1 });

  return {
    packages: items.map((item) => ({
      packageid: item.packageId,
      packagename: item.packageName,
      packageinfo: item.packageInfo,
      preprice: item.prePrice,
      postprice: item.postPrice,
      taxvalue: item.taxValue,
    })),
  };
}

module.exports = { listDataGiftPackagesMobile };
