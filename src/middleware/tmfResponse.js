// TMF-aligned responses don't use our old custom envelope
// ({ isSuccess, errorMessege, dataBundle, ... }) - a TMF API just returns the
// resource (or array of resources) directly as the response body.
// Errors follow TM Forum's standard Error schema instead.
// See: https://www.tmforum.org/oda/open-apis/table (Error resource, common to all TMF APIs)

function sendResource(res, resource, statusCode = 200) {
  return res.status(statusCode).json(resource);
}

function sendError(res, statusCode, reason, message) {
  return res.status(statusCode).json({
    code: String(statusCode),
    reason,
    message,
    status: String(statusCode),
    '@type': 'Error',
  });
}

module.exports = { sendResource, sendError };
