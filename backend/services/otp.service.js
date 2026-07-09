/**
 * services/otp.service.js — Secure OTP generation, hashing, and validation
 *
 * Never store plain OTPs in the database.
 * Uses bcrypt for OTP hashing (separate from password salt rounds).
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OTP } = require('../utils/constants');

/**
 * Generate a cryptographically secure 6-digit OTP.
 * @returns {string}
 */
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

/**
 * Hash an OTP before persisting.
 * @param {string} otp
 * @returns {Promise<string>}
 */
const hashOtp = async (otp) => bcrypt.hash(String(otp), OTP.BCRYPT_ROUNDS);

/**
 * Compare a user-submitted OTP against its bcrypt hash.
 * @param {string} otp
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const verifyOtpHash = async (otp, hash) => {
  if (!otp || !hash) return false;
  return bcrypt.compare(String(otp), hash);
};

/**
 * OTP expiry timestamp (10 minutes from now).
 * @returns {Date}
 */
const getExpiryDate = () => new Date(Date.now() + OTP.EXPIRY_MS);

/**
 * Check whether an OTP expiry date has passed.
 * @param {Date} expires
 * @returns {boolean}
 */
const isExpired = (expires) => !expires || new Date(expires).getTime() < Date.now();

/**
 * Enforce resend cooldown to prevent OTP spam.
 * @param {Date} lastSentAt
 * @returns {boolean}
 */
const canResendOtp = (lastSentAt) => {
  if (!lastSentAt) return true;
  return Date.now() - new Date(lastSentAt).getTime() >= OTP.RESEND_COOLDOWN_MS;
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getExpiryDate,
  isExpired,
  canResendOtp,
};
