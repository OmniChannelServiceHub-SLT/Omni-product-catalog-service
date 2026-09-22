const jwt = require('jsonwebtoken');
const { sendError } = require('../../../middleware/tmfResponse');

module.exports = function authorizeCallForwardingRequest(req, res, next) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return sendError(res, 503, 'ServiceUnavailable', 'Call forwarding authentication is not configured');
  }

  const authorization = req.headers.authorization || '';
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  if (!match) {
    res.set('WWW-Authenticate', 'Bearer');
    return sendError(res, 401, 'Unauthorized', 'A valid IAM bearer access token is required');
  }

  try {
    // IAM signs access tokens using HS256 and the same JWT_ACCESS_SECRET.
    const claims = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
    if (!claims || typeof claims.sub !== 'string' || !claims.sub.trim()
        || typeof claims.exp !== 'number') {
      throw new Error('Access token subject or expiry is missing');
    }
    req.callForwardingUserId = claims.sub;
  } catch {
    res.set('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendError(res, 401, 'Unauthorized', 'The IAM access token is invalid or expired');
  }

  return next();
};
