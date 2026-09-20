const { listDataGiftPackagesMobile } = require('../services/dataGiftPackagesMobileService');
const { toTmfResponse, toLegacyResponse } = require('../mappers/dataGiftPackagesMobileMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function listDataGiftPackagesMobileHandler(req, res) {
  try {
    const offerings = await listDataGiftPackagesMobile();

    if (req.headers['x-response-format'] === 'legacy') {
      return res.status(200).json(toLegacyResponse(offerings));
    }

    return res.status(200).json(toTmfResponse(offerings));
  } catch (err) {
    console.error('listDataGiftPackagesMobile failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch mobile data gift packages');
  }
}

module.exports = { listDataGiftPackagesMobile: listDataGiftPackagesMobileHandler };
