/**
 * models/User.js — User Schema and Model
 *
 * Enforces production standards:
 * - Password hashing via pre-save hook using bcryptjs
 * - Sensitive fields (like password) are hidden by default via `select: false`
 * - Helper methods for password comparison and token generation
 * - Indices on query-heavy fields (email)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true, // Index for fast login / lookup queries
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    // OTP-based verification (hashed — never plain text)
    emailVerificationOTP: {
      type: String,
      select: false,
    },
    emailVerificationOTPExpires: {
      type: Date,
      select: false,
    },
    forgotPasswordOTP: {
      type: String,
      select: false,
    },
    forgotPasswordOTPExpires: {
      type: Date,
      select: false,
    },
    lastForgotOtpSentAt: {
      type: Date,
    },
    // Legacy link tokens (kept for backward compatibility)
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Store current active refresh token (or its hash) for revocation support
    refreshToken: {
      type: String,
      select: false, // Hidden by default
    },
    profilePhoto: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    // Unique token embedded in QR codes — maps to public emergency page
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// ── Pre-Save Hooks ────────────────────────────────────────────────────────────

/**
 * Generate a unique QR token for new users.
 * Also hash password when modified.
 */
userSchema.pre('save', async function () {
  if (this.isNew && !this.qrToken) {
    this.qrToken = crypto.randomBytes(16).toString('hex');
  }

  // Only re-hash when the password field was actually changed
  if (!this.isModified('password')) {
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Methods ──────────────────────────────────────────────────────────

/**
 * Compare entered password with hashed password in database.
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // Since password has select: false, if it's not present on this document,
  // this comparison will fail. The caller must select('+password') first.
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate email verification token.
 * Returns raw token to send via email, saves SHA-256 hash to DB.
 * @returns {string} raw token
 */
userSchema.methods.generateVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Store SHA-256 hash in database
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  // Token expires in 24 hours (defined in constants)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return rawToken;
};

/**
 * Generate password reset token.
 * Returns raw token to send via email, saves SHA-256 hash to DB.
 * @returns {string} raw token
 */
userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Store SHA-256 hash in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  // Token expires in 15 minutes
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

  return rawToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
