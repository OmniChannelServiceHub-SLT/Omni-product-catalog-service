const express = require('express');
const router = express.Router();
const { listAdvancedReportingPackage } = require('../controllers/advancedReportingPackageController');

// GET /tmf-api/productInventoryManagement/v4/advancedReportingPackages
router.get('/', listAdvancedReportingPackage);

module.exports = router;
