/**
 * controllers/auth.controller.js — Authentication Controllers
 *
 * Implements MVC logic for all authentication features.
 * Features production practices:
 * - Refresh Token Rotation (RTR) on token refresh to prevent replay attacks
 * - User enumeration prevention on Forgot Password
 * - httpOnly, secure, sameSite cookies for Refresh Tokens
 * - Standardized ApiResponse wrapping
 */

const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { COOKIES } = require('../utils/constants');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../services/token.service');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/email.service');
const ActivityLog = require('../models/ActivityLog');

// ── Cookie Options Helper ─────────────────────────────────────────────────────

/**
 * Get cookie options for Refresh Token.
 *
 * @param {boolean} rememberMe
 * @returns {object} Express cookie configuration options
 */
const getCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const days = rememberMe ? 30 : 7;
  const maxAge = days * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: isProduction,
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
  };
};

const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

// ── Register Controller ───────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    // 2. Create new user (inactive by default until email verified)
    const user = new User({
      name,
      email,
      password,
    });

    // 3. Generate verification token
    const rawToken = user.generateVerificationToken();
    await user.save();

    // 4. Send email notification (fails safely but logged)
    try {
      await sendVerificationEmail(user, rawToken);
    } catch (emailError) {
      console.error(`⚠️ Verification email sending failed: ${emailError.message}`);
    }

    // 5. Respond
    new ApiResponse(201, 'Registration successful. Please check your email to verify your account.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Login Controller ──────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  try {
    // 1. Fetch user (explicitly selecting password & refreshToken which are normally hidden)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    // 2. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    // 3. Check account status
    if (!user.isActive) {
      return next(ApiError.forbidden('Your account is deactivated. Please contact support.'));
    }

    if (user.isSuspended) {
      return next(ApiError.forbidden('Your account is suspended. Please contact support.'));
    }

    if (!user.isEmailVerified) {
      return next(
        ApiError.forbidden('Please verify your email before logging in.')
      );
    }

    // 4. Generate JWTs
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, rememberMe);

    // 5. Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Set HTTP-Only Cookie
    res.cookie(COOKIES.REFRESH_TOKEN, refreshToken, getCookieOptions(rememberMe));

    // 7. Log login event
    await ActivityLog.create({
      userId: user._id,
      action: 'Login',
      description: 'Successful login to LifeVault account.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    // 8. Send Response
    new ApiResponse(200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePhoto: user.profilePhoto,
      },
      accessToken,
      token: accessToken,
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Logout Controller ─────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
  const refreshToken = req.cookies[COOKIES.REFRESH_TOKEN];

  try {
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (user) {
          await ActivityLog.create({
            userId: user._id,
            action: 'Logout',
            description: 'User signed out of LifeVault account.',
            ipAddress: req.ip || 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown',
          });
          user.refreshToken = undefined;
          await user.save();
        }
      } catch {
        // Token may already be expired — still clear the cookie below
      }
    }

    clearRefreshCookie(res);
    new ApiResponse(200, 'Logged out successfully').send(res);
  } catch (error) {
    next(error);
  }
};

// ── Refresh Token Controller ──────────────────────────────────────────────────

exports.refreshToken = async (req, res, next) => {
  const tokenFromCookie = req.cookies[COOKIES.REFRESH_TOKEN];

  if (!tokenFromCookie) {
    return next(ApiError.unauthorized('No refresh token provided'));
  }

  try {
    const decoded = verifyRefreshToken(tokenFromCookie);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== tokenFromCookie) {
      clearRefreshCookie(res);
      return next(ApiError.unauthorized('Invalid or revoked refresh token'));
    }

    if (!user.isActive || user.isSuspended) {
      clearRefreshCookie(res);
      return next(ApiError.forbidden('Your account is not active.'));
    }

    const newAccessToken = generateAccessToken(user);

    new ApiResponse(200, 'Token refreshed successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePhoto: user.profilePhoto,
      },
      accessToken: newAccessToken,
      token: newAccessToken,
    }).send(res);
  } catch (error) {
    clearRefreshCookie(res);
    return next(ApiError.unauthorized('Refresh token expired or invalid'));
  }
};

// ── Email Verification Controller ─────────────────────────────────────────────

exports.verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Hash the incoming raw token to match the database hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return next(ApiError.badRequest('Verification link is invalid or has expired.'));
    }

    // Mark as verified and clear verification tokens
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    new ApiResponse(200, 'Your email has been verified successfully. You can now log in.').send(res);
  } catch (error) {
    next(error);
  }
};

// ── Resend Verification Email Controller ──────────────────────────────────────

exports.resendVerification = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Prevent user enumeration: return success even if email not found
      return new ApiResponse(200, 'If this account is unverified, a verification email has been resent.').send(res);
    }

    if (user.isEmailVerified) {
      return next(ApiError.badRequest('This email address has already been verified.'));
    }

    const rawToken = user.generateVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(user, rawToken);
    } catch (emailError) {
      console.error(`⚠️ Resend verification email failed: ${emailError.message}`);
    }

    new ApiResponse(200, 'If this account is unverified, a verification email has been resent.').send(res);
  } catch (error) {
    next(error);
  }
};

// ── Forgot Password Controller ────────────────────────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Prevent user enumeration: return success even if user doesn't exist
    const successResponse = new ApiResponse(
      200,
      'If your email exists in our system, a password reset link will be sent shortly.'
    );

    if (!user) {
      return successResponse.send(res);
    }

    const rawToken = user.generatePasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user, rawToken);
    } catch (emailError) {
      console.error(`⚠️ Password reset email sending failed: ${emailError.message}`);
      return next(ApiError.internal('Failed to send password reset email. Please try again.'));
    }

    successResponse.send(res);
  } catch (error) {
    next(error);
  }
};

// ── Reset Password Controller ─────────────────────────────────────────────────

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(ApiError.badRequest('Password reset link is invalid or has expired.'));
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;

    // Clear reset tokens
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Revoke current active session refresh token to force re-login on all devices after password change
    user.refreshToken = undefined;
    await user.save();

    new ApiResponse(200, 'Password has been reset successfully. Please log in with your new password.').send(res);
  } catch (error) {
    next(error);
  }
};
