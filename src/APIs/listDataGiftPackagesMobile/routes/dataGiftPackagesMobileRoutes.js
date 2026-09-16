const express = require('express');
const router = express.Router();
const { listDataGiftPackagesMobile } = require('../controllers/dataGiftPackagesMobileController');

// GET /tmf-api/productCatalogManagement/v4/dataGiftPackagesMobile
router.get('/', listDataGiftPackagesMobile);

module.exports = router;
