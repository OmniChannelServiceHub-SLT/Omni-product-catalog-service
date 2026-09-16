const { listDashboardVASBundles } = require('../services/dashboardVASBundlesService');
const { success, failure } = require('../../../middleware/response');

async function listDashboardVASBundlesHandler(req, res) {
  try {
    const { subscriberID } = req.query;
    if (!subscriberID) {
      return failure(res, 400, 'subscriberID query parameter is required');
    }

    const dataBundle = await listDashboardVASBundles(subscriberID);
    if (!dataBundle) {
      return failure(res, 404, `No VAS dashboard data found for subscriberID=${subscriberID}`);
    }

    return success(res, dataBundle);
  } catch (err) {
    console.error('listDashboardVASBundles failed:', err);
    return failure(res, 500, 'Failed to fetch VAS dashboard bundles', err.message);
  }
}

module.exports = { listDashboardVASBundles: listDashboardVASBundlesHandler };
