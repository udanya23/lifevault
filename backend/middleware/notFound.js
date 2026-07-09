/**
 * middleware/notFound.js — 404 Catch-All Middleware
 *
 * Registered AFTER all routes in server.js.
 * Any request that doesn't match a defined route falls through to here.
 *
 * Without this, Express would return an ugly HTML 404 page.
 * We return a consistent JSON response matching our ApiError shape.
 */

const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  // Create an ApiError and pass it to the global error handler
  // This keeps all error formatting centralized in errorHandler.js
  const error = ApiError.notFound(
    `Cannot ${req.method} ${req.originalUrl} — route not found.`
  );
  next(error);
};

module.exports = notFound;
