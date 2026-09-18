// Row 117 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetVASDataBundlePackages" (GET), log seq A62
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function listVASDataBundlePackages() {
  return TMF620_ProductOffering.find({ offeringType: 'vasAddon' }).sort({ category: 1, packageId: 1 });
}

module.exports = { listVASDataBundlePackages };
