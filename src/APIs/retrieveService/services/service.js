"use strict";
// Shared voice profile: same mapping and provider behavior as PATCH.
const { createPatchServiceService } = require("../../patchService/services/service");
function createRetrieveServiceService(options) {
  return createPatchServiceService(options).retrieveService;
}
module.exports = { createRetrieveServiceService };
