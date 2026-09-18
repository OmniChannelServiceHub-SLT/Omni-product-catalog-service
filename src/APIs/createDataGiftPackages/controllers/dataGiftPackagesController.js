const { createDataGiftPackages } = require('../services/dataGiftPackagesService');
const { mapDataGiftPackages } = require('../mappers/dataGiftPackagesMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function createDataGiftPackagesHandler(req, res) {
  try {
    const offerings = await createDataGiftPackages();
    return sendResource(res, mapDataGiftPackages(offerings));
  } catch (err) {
    console.error('createDataGiftPackages failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch data gift packages');
  }
}

module.exports = { createDataGiftPackages: createDataGiftPackagesHandler };
