const { listBBPackages } = require('../services/bbPackagesService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/bbPackagesMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function listBBPackagesHandler(req, res) {
  try {
    const { type, package: packageName } = req.query;
    if (!type || !packageName) {
      return sendError(res, 400, 'MissingParameter', 'type and package query parameters are required');
    }

    const result = await listBBPackages(type, packageName);
    if (!result) {
      return sendError(res, 404, 'NotFound', `No package found matching type=${type}, package=${packageName}`);
    }

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(result));
    }

    return res.status(200).json(toTmfResponse(result));
  } catch (err) {
    console.error('listBBPackages failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch BB packages');
  }
}

module.exports = { listBBPackages: listBBPackagesHandler };
