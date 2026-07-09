/**
 * controllers/auth.otp.controller.js — OTP-based registration & password reset
 */

const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { COOKIES } = require('../utils/constants');
const {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getExpiryDate,
  isExpired,
  canResendOtp,
} = require('../services/otp.service');
const {
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
  sendWelcomeEmail,
} = require('../services/email.service');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../services/token.service');
const ActivityLog = require('../models/ActivityLog');

const getCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const days = rememberMe ? 30 : 7;
  return {
    httpOnly: true,
    secure: isProduction,
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};

const issueAuthResponse = async (user, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, rememberMe);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie(COOKIES.REFRESH_TOKEN, refreshToken, getCookieOptions(rememberMe));

  return {
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
  };
};

// ── Registration OTP ──────────────────────────────────────────────────────────

exports.sendRegistrationOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    let pending = await PendingRegistration.findOne({ email }).select(
      '+emailVerificationOTP +emailVerificationOTPExpires'
    );

    if (pending && !canResendOtp(pending.lastOtpSentAt)) {
      return next(
        ApiError.tooManyRequests('Please wait 60 seconds before requesting another OTP.')
      );
    }

    const rawOtp = generateOtp();
    const hashedOtp = await hashOtp(rawOtp);

    if (!pending) {
      pending = new PendingRegistration({ email });
    }

    pending.emailVerificationOTP = hashedOtp;
    pending.emailVerificationOTPExpires = getExpiryDate();
    pending.isEmailVerified = false;
    pending.lastOtpSentAt = new Date();
    await pending.save();

    try {
      await sendRegistrationOtpEmail(email, rawOtp);
    } catch (emailError) {
      console.error('⚠️ Registration OTP email failed:', emailError.message);
      return next(ApiError.internal('Failed to send verification email. Please try again.'));
    }

    new ApiResponse(200, 'Verification code sent to your email.').send(res);
  } catch (error) {
    next(error);
  }
};

exports.verifyRegistrationOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const pending = await PendingRegistration.findOne({ email }).select(
      '+emailVerificationOTP +emailVerificationOTPExpires'
    );

    if (!pending) {
      return next(ApiError.badRequest('No verification request found. Please request a new code.'));
    }

    if (isExpired(pending.emailVerificationOTPExpires)) {
      return next(ApiError.badRequest('Verification code has expired. Please request a new one.'));
    }

    const isValid = await verifyOtpHash(otp, pending.emailVerificationOTP);
    if (!isValid) {
      return next(ApiError.badRequest('Invalid verification code.'));
    }

    pending.isEmailVerified = true;
    pending.emailVerificationOTP = undefined;
    pending.emailVerificationOTPExpires = undefined;
    await pending.save();

    new ApiResponse(200, 'Email verified successfully. You can now complete registration.').send(res);
  } catch (error) {
    next(error);
  }
};

exports.registerAfterOtp = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending || !pending.isEmailVerified) {
      return next(
        ApiError.badRequest('Please verify your email with OTP before creating an account.')
      );
    }

    const user = new User({
      name,
      email,
      password,
      isEmailVerified: true,
    });
    await user.save();

    await PendingRegistration.deleteOne({ email });

    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('⚠️ Welcome email failed:', emailError.message);
    }

    await ActivityLog.create({
      userId: user._id,
      action: 'Register',
      description: 'New LifeVault account created via OTP verification.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    const authData = await issueAuthResponse(user, res, false);

    new ApiResponse(201, 'Account created successfully. Welcome to LifeVault!', authData).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Forgot Password OTP ───────────────────────────────────────────────────────

exports.sendForgotPasswordOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    const successResponse = new ApiResponse(
      200,
      'If your email exists in our system, a reset code will be sent shortly.'
    );

    const user = await User.findOne({ email }).select(
      '+forgotPasswordOTP +forgotPasswordOTPExpires'
    );

    if (!user) {
      return successResponse.send(res);
    }

    if (!canResendOtp(user.lastForgotOtpSentAt)) {
      return next(
        ApiError.tooManyRequests('Please wait 60 seconds before requesting another code.')
      );
    }

    const rawOtp = generateOtp();
    const hashedOtp = await hashOtp(rawOtp);

    user.forgotPasswordOTP = hashedOtp;
    user.forgotPasswordOTPExpires = getExpiryDate();
    user.lastForgotOtpSentAt = new Date();
    await user.save();

    try {
      await sendPasswordResetOtpEmail(user, rawOtp);
    } catch (emailError) {
      console.error('⚠️ Password reset OTP email failed:', emailError.message);
      return next(ApiError.internal('Failed to send reset code. Please try again.'));
    }

    successResponse.send(res);
  } catch (error) {
    next(error);
  }
};

exports.verifyForgotPasswordOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      '+forgotPasswordOTP +forgotPasswordOTPExpires'
    );

    if (!user) {
      return next(ApiError.badRequest('Invalid or expired reset code.'));
    }

    if (isExpired(user.forgotPasswordOTPExpires)) {
      return next(ApiError.badRequest('Reset code has expired. Please request a new one.'));
    }

    const isValid = await verifyOtpHash(otp, user.forgotPasswordOTP);
    if (!isValid) {
      return next(ApiError.badRequest('Invalid reset code.'));
    }

    new ApiResponse(200, 'Reset code verified. You may now set a new password.').send(res);
  } catch (error) {
    next(error);
  }
};

exports.resetPasswordWithOtp = async (req, res, next) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      '+forgotPasswordOTP +forgotPasswordOTPExpires +refreshToken'
    );

    if (!user) {
      return next(ApiError.badRequest('Invalid or expired reset code.'));
    }

    if (isExpired(user.forgotPasswordOTPExpires)) {
      return next(ApiError.badRequest('Reset code has expired. Please request a new one.'));
    }

    const isValid = await verifyOtpHash(otp, user.forgotPasswordOTP);
    if (!isValid) {
      return next(ApiError.badRequest('Invalid reset code.'));
    }

    user.password = password;
    user.forgotPasswordOTP = undefined;
    user.forgotPasswordOTPExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'Password Reset',
      description: 'Password reset via OTP.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Password reset successful. Please log in with your new password.').send(res);
  } catch (error) {
    next(error);
  }
};

module.exports.issueAuthResponse = issueAuthResponse;
