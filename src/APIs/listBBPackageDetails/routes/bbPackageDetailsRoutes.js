const express = require('express');
const router = express.Router();
const { listBBPackageDetails } = require('../controllers/bbPackageDetailsController');

// GET /tmf-api/productCatalogManagement/v4/bbPackageDetails?code=ADSL-WFP
router.get('/', listBBPackageDetails);

module.exports = router;
