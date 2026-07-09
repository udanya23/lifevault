/**
 * middleware/validate.middleware.js — Input Validation Evaluator
 *
 * Runs after express-validator rules. If validation errors exist,
 * it formats them nicely and forwards a BadRequest ApiError to the
 * global error handler.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format error array to a simple { field, message } format
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }

  next();
};

module.exports = validate;
