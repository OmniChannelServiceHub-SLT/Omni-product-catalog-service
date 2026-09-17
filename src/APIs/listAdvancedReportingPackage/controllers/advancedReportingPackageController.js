const { listAdvancedReportingPackage } = require('../services/advancedReportingPackageService');
const { success, failure } = require('../../../middleware/response');

async function listAdvancedReportingPackageHandler(req, res) {
  try {
    const dataBundle = await listAdvancedReportingPackage();
    return success(res, dataBundle);
  } catch (err) {
    console.error('listAdvancedReportingPackage failed:', err);
    return failure(res, 500, 'Failed to fetch advanced reporting packages', err.message);
  }
}

module.exports = { listAdvancedReportingPackage: listAdvancedReportingPackageHandler };
