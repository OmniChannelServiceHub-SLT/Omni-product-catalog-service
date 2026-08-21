const express = require('express');
const router = express.Router();
const { listBBPackages } = require('../controllers/bbPackagesController');

// GET /internal-api/product-catalog/v1/bbPackages?type=ADSL&package=WEB FAMILY PLUS
router.get('/', listBBPackages);

module.exports = router;
