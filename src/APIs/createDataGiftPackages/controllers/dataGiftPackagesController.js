const { createDataGiftPackages } = require('../services/dataGiftPackagesService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/dataGiftPackagesMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function createDataGiftPackagesHandler(req, res) {
  try {
    const offerings = await createDataGiftPackages();

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(offerings));
    }

    return res.status(200).json(toTmfResponse(offerings));
  } catch (err) {
    console.error('createDataGiftPackages failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch data gift packages');
  }
}

module.exports = { createDataGiftPackages: createDataGiftPackagesHandler };
