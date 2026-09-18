// Row 268 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBExternal] "GetBBPackageDetails" (GET), log seq A76
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function listBBPackageDetails(packageId) {
  return TMF620_ProductOffering.findOne({ offeringType: 'broadbandPackage', packageId });
}

module.exports = { listBBPackageDetails };
