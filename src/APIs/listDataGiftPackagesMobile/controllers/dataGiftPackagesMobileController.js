const { listDataGiftPackagesMobile } = require('../services/dataGiftPackagesMobileService');
const { success, failure } = require('../../../middleware/response');

async function listDataGiftPackagesMobileHandler(req, res) {
  try {
    const dataBundle = await listDataGiftPackagesMobile();
    return success(res, dataBundle);
  } catch (err) {
    console.error('listDataGiftPackagesMobile failed:', err);
    return failure(res, 500, 'Failed to fetch mobile data gift packages', err.message);
  }
}

module.exports = { listDataGiftPackagesMobile: listDataGiftPackagesMobileHandler };
