"use strict";
function createRetrieveServiceController({ retrieveService }) {
  return async function (req, res, next) {
    res.set("Cache-Control", "no-store");
    try {
      const result = await retrieveService({ id: req.params.id, query: req.query, user: req.user });
      return res.status(200).json(result);
    } catch (error) { return next(error); }
  };
}
module.exports = { createRetrieveServiceController };
