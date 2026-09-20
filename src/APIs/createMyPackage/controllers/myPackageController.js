const { createMyPackage } = require('../services/myPackageService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/myPackageMapper');
const { sendError } = require('../../../middleware/tmfResponse');

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

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(snapshot));
    }

    return res.status(200).json(toTmfResponse(snapshot));
  } catch (err) {
    console.error('createMyPackage failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch package usage');
  }
}

module.exports = { createMyPackage: createMyPackageHandler };
