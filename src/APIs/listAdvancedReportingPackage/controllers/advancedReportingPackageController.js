const { listAdvancedReportingPackage } = require('../services/advancedReportingPackageService');
const { mapAdvancedReportingPackage } = require('../mappers/advancedReportingPackageMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function listAdvancedReportingPackageHandler(req, res) {
  try {
    const offerings = await listAdvancedReportingPackage();
    return sendResource(res, mapAdvancedReportingPackage(offerings));
  } catch (err) {
    console.error('listAdvancedReportingPackage failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch advanced reporting packages');
  }
}

module.exports = { listAdvancedReportingPackage: listAdvancedReportingPackageHandler };
