// Row 146 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "DataGiftPackages" (GET), log seq A57
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function createDataGiftPackages() {
  return TMF620_ProductOffering.find({ offeringType: 'dataGift' }).sort({ packageId: 1 });
}

module.exports = { createDataGiftPackages };
