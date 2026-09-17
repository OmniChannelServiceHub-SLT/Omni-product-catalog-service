const express = require('express');
const router = express.Router();
const { createMyPackage } = require('../controllers/myPackageController');

// GET /tmf-api/productInventoryManagement/v4/myPackage?subscriberID=94382222802
router.get('/', createMyPackage);

module.exports = router;
