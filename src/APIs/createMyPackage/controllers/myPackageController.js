const { createMyPackage } = require('../services/myPackageService');
const { mapMyPackage } = require('../mappers/myPackageMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function createMyPackageHandler(req, res) {
  try {
    const { subscriberID } = req.query;
    if (!subscriberID) {
      return sendError(res, 400, 'MissingParameter', 'subscriberID query parameter is required');
    }

    const snapshot = await createMyPackage(subscriberID);
    if (!snapshot) {
      return sendError(res, 404, 'NotFound', `No package usage found for subscriberID=${subscriberID}`);
    }

    return sendResource(res, mapMyPackage(snapshot));
  } catch (err) {
    console.error('createMyPackage failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch package usage');
  }
}

module.exports = { createMyPackage: createMyPackageHandler };
