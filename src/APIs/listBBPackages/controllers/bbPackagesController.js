const { listBBPackages: fetchBBPackages } = require('../services/bbPackagesService');
const { success, failure } = require('../../../middleware/response');

async function listBBPackages(req, res) {
  try {
    const { type, package: packageName } = req.query;

    if (!type || !packageName) {
      return failure(res, 400, 'type and package query parameters are required');
    }

    const dataBundle = await fetchBBPackages(type, packageName);
    if (!dataBundle) {
      return failure(res, 404, `No package found matching type=${type}, package=${packageName}`);
    }

    return success(res, dataBundle);
  } catch (err) {
    console.error('listBBPackages failed:', err);
    return failure(res, 500, 'Failed to fetch BB packages', err.message);
  }
}

module.exports = { listBBPackages };
