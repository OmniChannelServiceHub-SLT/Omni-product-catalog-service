// Row 119 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetDataGiftPackagesMobile" (GET), log seq A65
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function listDataGiftPackagesMobile() {
  return TMF620_ProductOffering.find({ offeringType: 'dataGiftMobile' }).sort({ packageId: 1 });
}

module.exports = { listDataGiftPackagesMobile };
