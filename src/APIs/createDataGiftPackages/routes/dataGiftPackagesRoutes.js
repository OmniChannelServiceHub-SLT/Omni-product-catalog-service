const express = require('express');
const router = express.Router();
const { createDataGiftPackages } = require('../controllers/dataGiftPackagesController');

// GET /tmf-api/productCatalogManagement/v4/dataGiftPackages?subscriberID=...
router.get('/', createDataGiftPackages);

module.exports = router;
