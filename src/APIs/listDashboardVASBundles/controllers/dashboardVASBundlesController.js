const { listDashboardVASBundles } = require('../services/dashboardVASBundlesService');
const { mapDashboardVASBundles } = require('../mappers/dashboardVASBundlesMapper');
const { sendResource, sendError } = require('../../../middleware/tmfResponse');

async function listDashboardVASBundlesHandler(req, res) {
  try {
    const { subscriberID } = req.query;
    if (!subscriberID) {
      return sendError(res, 400, 'MissingParameter', 'subscriberID query parameter is required');
    }

    const snapshot = await listDashboardVASBundles(subscriberID);
    if (!snapshot) {
      return sendError(res, 404, 'NotFound', `No VAS dashboard data found for subscriberID=${subscriberID}`);
    }

    return sendResource(res, mapDashboardVASBundles(snapshot));
  } catch (err) {
    console.error('listDashboardVASBundles failed:', err);
    return sendError(res, 500, 'InternalError', 'Failed to fetch VAS dashboard bundles');
  }
}

module.exports = { listDashboardVASBundles: listDashboardVASBundlesHandler };
