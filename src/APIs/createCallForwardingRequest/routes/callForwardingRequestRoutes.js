const express = require('express');
const { sendError } = require('../../../middleware/tmfResponse');
const authorize = require('../middleware/authorizeCallForwardingRequest');
const { createCallForwardingRequest } = require('../controllers/callForwardingRequestController');

const router = express.Router();

router.use((req, res, next) => {
  // The workbook requires GET for a submission. Responses must never be cached.
  res.set('Cache-Control', 'no-store');
  next();
});

function methodNotAllowed(req, res) {
  res.set('Allow', 'GET');
  return sendError(res, 405, 'MethodNotAllowed', 'Use GET to submit a call forwarding request');
}

// Express otherwise dispatches HEAD to the GET handler, causing an unintended write.
router.head('/', methodNotAllowed);
router.get('/', authorize, createCallForwardingRequest);
router.all('/', methodNotAllowed);

module.exports = router;
