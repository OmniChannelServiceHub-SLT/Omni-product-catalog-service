const express = require('express');
const router = express.Router();
const { listVASDataBundlePackages } = require('../controllers/vasDataBundlePackagesController');

// GET /internal-api/product-catalog/v1/vasDataBundlePackages?subscriberID=...&packageName=...
router.get('/', listVASDataBundlePackages);

module.exports = router;
