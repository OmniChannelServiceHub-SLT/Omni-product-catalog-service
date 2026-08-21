const { listBBPackageDetails: fetchBBPackageDetails } = require('../services/bbPackageDetailsService');
const { success, failure } = require('../../../middleware/response');

async function listBBPackageDetails(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return failure(res, 400, 'code query parameter is required');
    }

    const dataBundle = await fetchBBPackageDetails(code);
    if (!dataBundle) {
      return failure(res, 404, `No package found for code=${code}`);
    }

    return success(res, dataBundle);
  } catch (err) {
    console.error('listBBPackageDetails failed:', err);
    return failure(res, 500, 'Failed to fetch BB package details', err.message);
  }
}

module.exports = { listBBPackageDetails };
