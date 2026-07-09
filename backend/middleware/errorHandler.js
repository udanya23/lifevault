/**
 * middleware/errorHandler.js — Global Express Error Handler
 *
 * This is the LAST middleware registered in server.js (after all routes).
 * Express automatically routes any error passed to `next(error)` here.
 *
 * It handles three distinct error categories:
 *   1. Our own ApiError (operational, safe to expose)
 *   2. Known library errors (Mongoose, JWT, Multer)
 *   3. Unknown/programming errors (generic 500, no leak)
 */

const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  // Log every error server-side regardless of type
  // In production you'd send this to a service like Sentry
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  } else {
    console.error('🔴 Error:', err.message);
  }

  // ── 1. Our own ApiError ───────────────────────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
      // Only include stack trace in development
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // ── 2. Mongoose: Duplicate Key Error ──────────────────────────────────────
  // e.g. trying to register with an email that already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} (${value}) already exists.`,
    });
  }

  // ── 3. Mongoose: Validation Error ────────────────────────────────────────
  // e.g. a required field missing or enum mismatch
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── 4. Mongoose: CastError ────────────────────────────────────────────────
  // e.g. an invalid MongoDB ObjectId in the URL param
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ── 5. JWT: JsonWebTokenError ─────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }

  // ── 6. JWT: TokenExpiredError ─────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
    });
  }

  // ── 7. Multer: File Too Large ──────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File is too large. Maximum allowed size is 5MB.',
    });
  }

  // ── 8. Unknown/Programming Error ─────────────────────────────────────────
  // NEVER expose internal error details to the client in production
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An internal server error occurred. Please try again later.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
