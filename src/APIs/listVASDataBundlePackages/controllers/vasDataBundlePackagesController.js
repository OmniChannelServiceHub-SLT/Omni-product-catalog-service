const { listVASDataBundlePackages } = require('../services/vasDataBundlePackagesService');
const { mapVASDataBundlePackages } = require('../mappers/vasDataBundlePackagesMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function listVASDataBundlePackagesHandler(req, res) {
  try {
    const offerings = await listVASDataBundlePackages();
    return sendResource(res, mapVASDataBundlePackages(offerings));
  } catch (err) {
    console.error('listVASDataBundlePackages failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch VAS data bundle packages');
  }
}

module.exports = { listVASDataBundlePackages: listVASDataBundlePackagesHandler };
