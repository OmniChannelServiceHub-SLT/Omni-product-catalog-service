const { createMyPackage } = require('../services/myPackageService');
const { success, failure } = require('../../../middleware/response');

async function createMyPackageHandler(req, res) {
  try {
    const { subscriberID } = req.query;
    if (!subscriberID) {
      return failure(res, 400, 'subscriberID query parameter is required');
    }

    const dataBundle = await createMyPackage(subscriberID);
    if (!dataBundle) {
      return failure(res, 404, `No package usage found for subscriberID=${subscriberID}`);
    }

    return success(res, dataBundle);
  } catch (err) {
    console.error('createMyPackage failed:', err);
    return failure(res, 500, 'Failed to fetch package usage', err.message);
  }
}

module.exports = { createMyPackage: createMyPackageHandler };
