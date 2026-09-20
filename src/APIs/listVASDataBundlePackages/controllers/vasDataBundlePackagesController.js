const { listVASDataBundlePackages } = require('../services/vasDataBundlePackagesService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/vasDataBundlePackagesMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function listVASDataBundlePackagesHandler(req, res) {
  try {
    const offerings = await listVASDataBundlePackages();

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(offerings));
    }

    return res.status(200).json(toTmfResponse(offerings));
  } catch (err) {
    console.error('listVASDataBundlePackages failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch VAS data bundle packages');
  }
}

module.exports = { listVASDataBundlePackages: listVASDataBundlePackagesHandler };
