/**
 * middleware/auth.middleware.js — Authentication Guard Middleware
 *
 * Implements route protection and role-based access control.
 *
 * Flow of `protect`:
 * 1. Checks for Authorization header (Bearer token)
 * 2. Verifies the token signature & expiration
 * 3. Finds user in DB and checks status (must be active & not suspended)
 * 4. Attaches the User object to the Request object as `req.user`
 */

const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { verifyAccessToken } = require('../services/token.service');

/**
 * Protect route — requires a valid JWT Access Token in the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(ApiError.unauthorized('Access denied. No token provided.'));
  }

  try {
    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(ApiError.unauthorized('The user belonging to this token no longer exists.'));
    }

    // 4. Check if user is active & not suspended
    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated.'));
    }

    if (user.isSuspended) {
      return next(ApiError.forbidden('Your account has been suspended. Please contact support.'));
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Distinguish expiration from general malformed tokens
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    return next(ApiError.unauthorized('Invalid token. Session cleared.'));
  }
};

/**
 * Authorize roles — restricts access to specific user roles (e.g. admin).
 * Must be registered AFTER protect.
 *
 * @param {...string} roles - List of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Unauthorized.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

/**
 * Optional Auth — does not fail if no token or expired token.
 * Populates req.user if token is valid.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (user && user.isActive && !user.isSuspended) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Silently continue since auth is optional
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  // Aliases matching common naming conventions
  authenticateUser: protect,
  authorizeRoles: authorize,
};
