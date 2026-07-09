/**
 * models/PendingRegistration.js — Pre-registration email verification store
 *
 * Holds OTP verification state before a User account is created.
 * Deleted after successful registration.
 */

const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    emailVerificationOTP: {
      type: String,
      select: false,
    },
    emailVerificationOTPExpires: {
      type: Date,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastOtpSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
