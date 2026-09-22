const express = require('express');
const router = express.Router();

const {
  listBBFreedomStatus
} = require('../controllers/bbFreedomStatusController');

// GET /tmf-api/productInventoryManagement/v4/bbFreedomStatus?tpNo=0673122397
router.get('/', listBBFreedomStatus);

module.exports = router;