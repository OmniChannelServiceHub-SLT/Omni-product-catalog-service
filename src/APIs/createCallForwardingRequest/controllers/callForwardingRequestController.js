const { createCallForwardingRequest } = require('../services/callForwardingRequestService');
const { toLegacyResponse, toTmfResponse } = require('../mappers/callForwardingRequestMapper');
const { sendError } = require('../../../middleware/tmfResponse');

async function createCallForwardingRequestHandler(req, res) {
  try {
    const request = await createCallForwardingRequest(req.query, req.callForwardingUserId);
    const response = req.headers['x-response-format'] === 'legacy'
      ? toLegacyResponse()
      : toTmfResponse(request);
    return res.status(200).json(response);
  } catch (error) {
    if (error.status === 400) {
      return sendError(res, 400, error.code, error.message);
    }
    // Do not log JWTs, telephone numbers, or raw database errors containing request data.
    console.error('createCallForwardingRequest failed:', error.name || 'Error');
    return sendError(res, 500, 'InternalError', 'Unable to submit the call forwarding request');
  }
}

module.exports = { createCallForwardingRequest: createCallForwardingRequestHandler };
