const { listBBPackageDetails } = require('../services/bbPackageDetailsService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/bbPackageDetailsMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function listBBPackageDetailsHandler(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return sendError(res, 400, 'MissingParameter', 'code query parameter is required');
    }

    const offering = await listBBPackageDetails(code);
    if (!offering) {
      return sendError(res, 404, 'NotFound', `No package found for code=${code}`);
    }

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(offering));
    }

    return res.status(200).json(toTmfResponse(offering));
  } catch (err) {
    console.error('listBBPackageDetails failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch BB package details');
  }
}

module.exports = { listBBPackageDetails: listBBPackageDetailsHandler };
