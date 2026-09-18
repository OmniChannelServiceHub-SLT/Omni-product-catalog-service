const { listDataGiftPackagesMobile } = require('../services/dataGiftPackagesMobileService');
const { mapDataGiftPackagesMobile } = require('../mappers/dataGiftPackagesMobileMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function listDataGiftPackagesMobileHandler(req, res) {
  try {
    const offerings = await listDataGiftPackagesMobile();
    return sendResource(res, mapDataGiftPackagesMobile(offerings));
  } catch (err) {
    console.error('listDataGiftPackagesMobile failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch mobile data gift packages');
  }
}

module.exports = { listDataGiftPackagesMobile: listDataGiftPackagesMobileHandler };
