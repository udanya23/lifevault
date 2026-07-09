/**
 * routes/auth.routes.js — Authentication Routes
 */

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const authOtpController = require('../controllers/auth.otp.controller');
const {
  registerRules,
  registerAfterOtpRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  sendOtpRules,
  verifyOtpRules,
  resetPasswordOtpRules,
} = require('../validators/auth.validators');

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again in 15 minutes.',
  },
});

// ── OTP Registration Flow ─────────────────────────────────────────────────────
router.post('/send-otp', otpLimiter, sendOtpRules, authOtpController.sendRegistrationOtp);
router.post('/verify-otp', authLimiter, verifyOtpRules, authOtpController.verifyRegistrationOtp);
router.post('/register', authLimiter, registerAfterOtpRules, authOtpController.registerAfterOtp);

// ── Core Auth ─────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// ── OTP Forgot Password Flow ──────────────────────────────────────────────────
router.post(
  '/forgot-password/send-otp',
  otpLimiter,
  forgotPasswordRules,
  authOtpController.sendForgotPasswordOtp
);
router.post(
  '/forgot-password/verify-otp',
  authLimiter,
  verifyOtpRules,
  authOtpController.verifyForgotPasswordOtp
);
router.post(
  '/forgot-password/reset',
  authLimiter,
  resetPasswordOtpRules,
  authOtpController.resetPasswordWithOtp
);

// ── Legacy link-based flows (backward compatibility) ────────────────────────
router.get('/verify-email/:token', verifyEmailRules, authController.verifyEmail);
router.post('/resend-verification', authLimiter, forgotPasswordRules, authController.resendVerification);
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, authController.resetPassword);

module.exports = router;
