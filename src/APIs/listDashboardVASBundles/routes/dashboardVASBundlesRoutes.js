const express = require('express');
const router = express.Router();
const { listDashboardVASBundles } = require('../controllers/dashboardVASBundlesController');

// GET /tmf-api/productCatalogManagement/v4/dashboardVASBundles?subscriberID=cen2431747
router.get('/', listDashboardVASBundles);

module.exports = router;
