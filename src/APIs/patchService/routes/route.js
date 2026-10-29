"use strict";

const express = require("express");
const { createPatchServiceService } = require("../services/service");
const { createPatchServiceController } = require("../controllers/controller");

function createPatchServiceRouter(options) {
  if (typeof options.jwtAuth !== "function") {
    throw new TypeError("JWT middleware is required.");
  }
  const service = createPatchServiceService(options);
  const controller = createPatchServiceController(service);
  const router = express.Router();

  function patchMedia(req, res, next) {
    res.set("Accept-Patch", "application/json, application/merge-patch+json");
    if (!req.is(["application/json", "application/merge-patch+json"])) {
      return next(Object.assign(
        new Error("Supported patch types: application/json, application/merge-patch+json."),
        { statusCode: 415 },
      ));
    }
    return next();
  }

  router.patch(
    "/service/:id",
    options.jwtAuth,
    patchMedia,
    express.json({
      type: ["application/json", "application/merge-patch+json"],
      limit: "32kb",
    }),
    controller.patchService,
  );

  // GET is owned by the separate retrieveService router.

  return router;
}

module.exports = { createPatchServiceRouter };
