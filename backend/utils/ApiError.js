/**
 * ApiError - Custom error class for operational errors
 *
 * Distinguishes between:
 *   - Operational errors (predictable, e.g. validation failure, 404)
 *     → safe to expose to client
 *   - Programming errors (bugs) → should NOT be exposed
 *
 * The global error handler checks `error.isOperational` to decide
 * whether to show the actual message or a generic fallback.
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode    - HTTP status code (400, 401, 403, 404, 500…)
   * @param {string}   message       - Error message to send to client
   * @param {Array}    errors        - Field-level validation errors array (optional)
   * @param {string}   stack         - Custom stack trace (rarely needed manually)
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;   // e.g. [{ field: 'email', message: 'Invalid email' }]
    this.isOperational = true; // marks this as a known, safe-to-expose error

    // Attach stack trace if provided, otherwise capture it automatically
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Convenience factory methods ─────────────────────────────────────────

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Too many requests, please try again later.') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
