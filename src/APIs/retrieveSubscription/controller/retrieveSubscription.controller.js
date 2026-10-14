'use strict';

function createRetrieveSubscriptionController({ retrieveSubscription }) {
  return async function retrieveSubscriptionController(req, res) {
    try {
      const product = await retrieveSubscription({
        id: req.params.id,
        fields: req.query.fields,
        user: req.user
      });
      return res.status(200).json(product);
    } catch (error) {
      const expected = [400, 403, 404].includes(error.statusCode);
      const status = expected ? error.statusCode : 500;
      // Unexpected database/internal errors are not exposed to callers.
      return res.status(status).json({
        code: expected ? error.code : 'INTERNAL_ERROR',
        reason: expected ? error.reason : 'Internal Server Error',
        message: expected ? error.message : 'Unable to retrieve the product.',
        status: String(status)
      });
    }
  };
}

module.exports = { createRetrieveSubscriptionController };
