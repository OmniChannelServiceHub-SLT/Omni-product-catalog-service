const express = require('express');
const router = express.Router();
const { listVASDataBundlePackages } = require('../controllers/vasDataBundlePackagesController');

// GET /tmf-api/productCatalogManagement/v4/vasDataBundlePackages
router.get('/', listVASDataBundlePackages);

module.exports = router;
