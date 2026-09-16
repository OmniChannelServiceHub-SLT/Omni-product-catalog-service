const { createDataGiftPackages } = require('../services/dataGiftPackagesService');
const { success, failure } = require('../../../middleware/response');

async function createDataGiftPackagesHandler(req, res) {
  try {
    const dataBundle = await createDataGiftPackages();
    return success(res, dataBundle);
  } catch (err) {
    console.error('createDataGiftPackages failed:', err);
    return failure(res, 500, 'Failed to fetch data gift packages', err.message);
  }
}

module.exports = { createDataGiftPackages: createDataGiftPackagesHandler };
