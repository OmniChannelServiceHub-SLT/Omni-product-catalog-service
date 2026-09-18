// Row 143 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetAdvancedReportingPackage" (GET), log seq A49
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function listAdvancedReportingPackage() {
  return TMF620_ProductOffering.find({ offeringType: 'advancedReporting' }).sort({ packageId: 1 });
}

module.exports = { listAdvancedReportingPackage };
