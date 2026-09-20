const { listAdvancedReportingPackage } = require('../services/advancedReportingPackageService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/advancedReportingPackageMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function listAdvancedReportingPackageHandler(req, res) {
  try {
    const offerings = await listAdvancedReportingPackage();

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(offerings));
    }

    return res.status(200).json(toTmfResponse(offerings));
  } catch (err) {
    console.error('listAdvancedReportingPackage failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch advanced reporting packages');
  }
}

module.exports = { listAdvancedReportingPackage: listAdvancedReportingPackageHandler };
