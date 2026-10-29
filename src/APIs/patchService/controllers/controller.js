"use strict";

function createPatchServiceController(service) {
  return {
    async patchService(req, res, next) {
      res.set("Cache-Control", "no-store");
      try {
        const result = await service.patchService({
          id: req.params.id,
          query: req.query,
          body: req.body,
          user: req.user,
        });
        // TMF638 v5 permits 202 with no Service response body.
        res.set("Content-Location", result.href);
        if (result.service) return res.status(result.status).json(result.service);
        return res.status(result.status).end();
      } catch (error) {
        return next(error);
      }
    },

    async retrieveService(req, res, next) {
      res.set("Cache-Control", "no-store");
      try {
        const result = await service.retrieveService({
          id: req.params.id,
          query: req.query,
          user: req.user,
        });
        return res.status(200).json(result);
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createPatchServiceController };
