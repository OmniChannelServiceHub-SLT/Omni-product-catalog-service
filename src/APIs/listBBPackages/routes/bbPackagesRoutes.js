const express = require('express');
const router = express.Router();
const { listBBPackages } = require('../controllers/bbPackagesController');

// GET /tmf-api/productCatalogManagement/v4/bbPackages?type=ADSL&package=WEB FAMILY PLUS
router.get('/', listBBPackages);

module.exports = router;
