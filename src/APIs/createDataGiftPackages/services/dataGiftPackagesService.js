// Row 146 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "DataGiftPackages" (GET), log seq A57
// NOTE: the source params sheet has no captured sample response for this one
// (sheet "57" is blank) - shape below is modelled on the sibling catalog API
// listAdvancedReportingPackage (A49), which IS documented with a real sample,
// since both are "list of purchasable packages" catalogs from the same BBVAS
// controller. Swap this out once a real sample response is available.
const PackageCatalogItem = require('../../../models/PackageCatalogItem');

async function createDataGiftPackages() {
  const items = await PackageCatalogItem.find({ catalogType: 'dataGift' }).sort({ packageId: 1 });

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

module.exports = { createDataGiftPackages };
