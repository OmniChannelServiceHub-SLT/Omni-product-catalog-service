// Row 143 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetAdvancedReportingPackage" (GET), log seq A49
const PackageCatalogItem = require('../../../models/PackageCatalogItem');

async function listAdvancedReportingPackage() {
  const items = await PackageCatalogItem.find({ catalogType: 'advancedReporting' }).sort({ packageId: 1 });

  // Matches real dataBundle shape from API_Params_SLTOMNI_V2_0_1.xlsx sheet "49":
  // dataBundle.packages[]
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

module.exports = { listAdvancedReportingPackage };
