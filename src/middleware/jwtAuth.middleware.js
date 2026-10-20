"use strict";

const jwt = require("jsonwebtoken");

// Load .env in server.js before importing app.js.
const algorithm = process.env.JWT_ALGORITHM || "HS256";
const issuer = process.env.JWT_ISSUER;
const audience = process.env.JWT_AUDIENCE;

if (!["HS256", "RS256"].includes(algorithm)) {
  throw new Error("JWT_ALGORITHM must be HS256 or RS256.");
}

if (!issuer || !audience) {
  throw new Error("JWT_ISSUER and JWT_AUDIENCE are required.");
}

const verificationKey =
  algorithm === "HS256"
    ? process.env.JWT_ACCESS_SECRET
    : process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, "\n");

if (!verificationKey) {
  throw new Error(
    algorithm === "HS256"
      ? "JWT_ACCESS_SECRET is required for HS256."
      : "JWT_PUBLIC_KEY is required for RS256.",
  );
}

function unauthorized(res, message, invalidToken = false) {
  res.set(
    "WWW-Authenticate",
    invalidToken ? 'Bearer error="invalid_token"' : "Bearer",
  );

  return res.status(401).json({
    code: "401",
    reason: "Unauthorized",
    message,
    status: "401",
    "@type": "Error",
  });
}

function jwtAuth(req, res, next) {
  const header = req.headers.authorization;

  if (typeof header !== "string") {
    return unauthorized(
      res,
      "An Authorization: Bearer <token> header is required.",
    );
  }

  const match = /^Bearer[ \t]+([^\s]+)$/i.exec(header);

  if (!match) {
    return unauthorized(
      res,
      "The Authorization header must use the Bearer scheme.",
    );
  }

  let claims;

  try {
    claims = jwt.verify(match[1], verificationKey, {
      algorithms: [algorithm],
      issuer,
      audience,
    });

    // Require expiry; jwt.verify checks whether it has expired.
    if (
      !claims ||
      typeof claims !== "object" ||
      Array.isArray(claims) ||
      typeof claims.exp !== "number" ||
      !Number.isFinite(claims.exp)
    ) {
      return unauthorized(
        res,
        "The access token must contain a valid expiry.",
        true,
      );
    }
  } catch (error) {
    return unauthorized(
      res,
      error.name === "TokenExpiredError"
        ? "The access token has expired."
        : "The access token is invalid or not yet valid.",
      true,
    );
  }

  req.user = claims;
  return next();
}

module.exports = jwtAuth;
