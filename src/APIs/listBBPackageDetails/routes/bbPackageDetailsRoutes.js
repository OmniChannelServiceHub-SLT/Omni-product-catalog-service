const express = require('express');
const router = express.Router();
const { listBBPackageDetails } = require('../controllers/bbPackageDetailsController');

// GET /internal-api/product-catalog/v1/bbPackageDetails?code=ADSL-WFP
router.get('/', listBBPackageDetails);

module.exports = router;
