const { listVASDataBundlePackages: fetchVASDataBundlePackages } = require('../services/vasDataBundlePackagesService');
const { success, failure } = require('../../../middleware/response');

async function listVASDataBundlePackages(req, res) {
  try {
    // subscriberID / packageName are accepted (legacy query params) but this
    // service only owns the VAS addon catalog, so it doesn't need them yet -
    // no synchronous call to another microservice, per the assignment rules.
    const dataBundle = await fetchVASDataBundlePackages();
    return success(res, dataBundle);
  } catch (err) {
    console.error('listVASDataBundlePackages failed:', err);
    return failure(res, 500, 'Failed to fetch VAS data bundle packages', err.message);
  }
}

module.exports = { listVASDataBundlePackages };
