/**
 * services/token.service.js — JWT Token Generation & Verification
 *
 * Responsibilities:
 * - Generate short-lived Access Tokens (stored in-memory by frontend)
 * - Generate longer-lived Refresh Tokens (stored in httpOnly cookie)
 * - Handle "Remember Me" by extending Refresh Token expiration
 * - Verify signatures of incoming tokens
 */

const jwt = require('jsonwebtoken');

const accessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const refreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

/**
 * Generate a short-lived access token.
 * Contains user identification and role.
 *
 * @param {object} user - User document or object containing id and role
 * @returns {string} Signed JWT Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    accessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate a longer-lived refresh token.
 * If rememberMe is true, it extends the token validity.
 *
 * @param {object} user        - User document or object containing id
 * @param {boolean} rememberMe - Whether user checked "Remember Me"
 * @returns {string} Signed JWT Refresh Token
 */
const generateRefreshToken = (user, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d'
    : process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(
    { id: user._id || user.id },
    refreshSecret(),
    { expiresIn }
  );
};

/**
 * Verify an Access Token.
 * Throws an error if expired or signature is invalid.
 *
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, accessSecret());
};

/**
 * Verify a Refresh Token.
 * Throws an error if expired or signature is invalid.
 *
 * @param {string} token
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret());
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
