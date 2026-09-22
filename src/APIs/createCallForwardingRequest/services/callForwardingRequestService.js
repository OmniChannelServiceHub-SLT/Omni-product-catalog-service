// Workbook entry #289, Product Catalog and Inventory S, Excel row 36.
// Legacy source: [Voice] CallForwardingRequest (GET), API Params A94 / response sheet 94.
const CallForwardingRequest = require('../../../models/CallForwardingRequest');

function inputError(code, message) {
  const error = new Error(message);
  error.status = 400;
  error.code = code;
  return error;
}

function requiredString(query, name) {
  const value = query[name];
  if (value === undefined || value === null || value === '') {
    throw inputError('MissingParameter', `${name} query parameter is required`);
  }
  // Reject repeated query keys and nested objects before building a database record.
  if (typeof value !== 'string') {
    throw inputError('InvalidParameter', `${name} must be a single string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw inputError('MissingParameter', `${name} query parameter is required`);
  }
  return trimmed;
}

async function createCallForwardingRequest(query, requestedBy) {
  const telephoneNo = requiredString(query, 'telephoneNo');
  const mobileNo = requiredString(query, 'mobileNo');
  const requestType = requiredString(query, 'requestType');

  // Keep numbers as strings to retain leading zeroes. Do not rewrite country codes.
  const phonePattern = /^\+?[0-9]{1,15}$/;
  for (const [name, value] of [['telephoneNo', telephoneNo], ['mobileNo', mobileNo]]) {
    if (!phonePattern.test(value)) {
      throw inputError('InvalidParameter', `${name} must contain 1 to 15 digits with an optional leading +`);
    }
  }
  // Only the Y operation is documented and authorized for this implementation.
  if (requestType !== 'Y') {
    throw inputError('InvalidParameter', 'requestType must be Y');
  }

  // Each accepted invocation is a new submission. Do not silently merge requests.
  // Await the write so a database failure can never produce a success acknowledgement.
  return await CallForwardingRequest.create({
    telephoneNo,
    mobileNo,
    requestType,
    requestedBy,
  });
}

module.exports = { createCallForwardingRequest };
