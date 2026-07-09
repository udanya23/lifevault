/**
 * helpers.js — Pure utility functions used across the backend
 *
 * These are stateless functions with no side effects.
 * They don't import from our own modules to avoid circular deps.
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure random hex token.
 * Used for email verification and password reset tokens.
 *
 * @param {number} byteLength - Number of random bytes (default 32 → 64 hex chars)
 * @returns {string} hex token
 */
const generateSecureToken = (byteLength = 32) => {
  return crypto.randomBytes(byteLength).toString('hex');
};

/**
 * Hash a plain token using SHA-256.
 * We store only the hash in the DB — never the raw token.
 * This mirrors how bcrypt protects passwords.
 *
 * @param {string} token
 * @returns {string} SHA-256 hex digest
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Build a standard pagination response object.
 * Attach this to ApiResponse.meta for all paginated list endpoints.
 *
 * @param {number} page     - Current page (1-indexed)
 * @param {number} limit    - Items per page
 * @param {number} total    - Total matching documents in DB
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Sanitize a MongoDB query page/limit from request query params.
 * Ensures values are integers and within safe bounds.
 *
 * @param {object} query - req.query object
 * @param {number} maxLimit - Maximum allowed limit
 */
const parsePagination = (query, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Remove sensitive fields from a user/document object before sending.
 * Returns a plain object (not a Mongoose document).
 *
 * @param {object} obj  - Mongoose doc or plain object
 * @param {string[]} fields - Array of field names to omit
 */
const omitFields = (obj, fields = []) => {
  const plain = obj.toObject ? obj.toObject() : { ...obj };
  fields.forEach((f) => delete plain[f]);
  return plain;
};

/**
 * Calculate what % of profile fields are completed.
 * Used on the dashboard "Profile Completion" card.
 *
 * @param {object} profile  - Profile document
 * @param {object} medical  - MedicalInfo document
 * @param {Array}  contacts - EmergencyContact documents
 * @param {Array}  documents - Document documents
 */
const calcProfileCompletion = (profile, medical, contacts, documents) => {
  const checks = [
    // Personal info (weight 40%)
    !!profile?.dob,
    !!profile?.gender,
    !!profile?.bloodGroup,
    !!profile?.height,
    !!profile?.weight,
    !!(profile?.address?.city),
    // Emergency contact (weight 20%)
    contacts?.length > 0,
    // Medical info (weight 25%)
    !!medical,
    medical?.allergies?.length > 0,
    medical?.currentMedicines?.length > 0,
    // Documents (weight 15%)
    documents?.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

/**
 * Format a date to a human-readable string.
 * e.g. "July 4, 2026"
 *
 * @param {Date|string} date
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

module.exports = {
  generateSecureToken,
  hashToken,
  getPaginationMeta,
  parsePagination,
  omitFields,
  calcProfileCompletion,
  formatDate,
};
