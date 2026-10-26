"use strict";

function createGetDashboardVasController({ getDashboardVas }) {
  if (typeof getDashboardVas !== "function") {
    throw new TypeError("getDashboardVas service is required.");
  }

  return async function getDashboardVasController(req, res, next) {
    res.set("Cache-Control", "no-store");

    try {
      const dashboard = await getDashboardVas({
        query: req.query,
        user: req.user,
      });

      return res.status(200).json(dashboard);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createGetDashboardVasController,
};
