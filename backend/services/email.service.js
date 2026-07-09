/**
 * services/email.service.js — Email Notification Service
 */

const {
  sendEmail,
  getVerificationEmailHTML,
  getPasswordResetEmailHTML,
  getRegistrationOtpEmailHTML,
  getPasswordResetOtpEmailHTML,
  getWelcomeEmailHTML,
} = require('../config/email');

const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email/${rawToken}`;
  const html = getVerificationEmailHTML(user.name, verificationUrl);

  await sendEmail({
    to: user.email,
    subject: '🔐 Verify your LifeVault Email Address',
    html,
  });
};

const sendPasswordResetEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`;
  const html = getPasswordResetEmailHTML(user.name, resetUrl);

  await sendEmail({
    to: user.email,
    subject: '🔑 Reset your LifeVault Password',
    html,
  });
};

/** Send 6-digit OTP for registration email verification */
const sendRegistrationOtpEmail = async (email, otp) => {
  const html = getRegistrationOtpEmailHTML(email, otp);
  await sendEmail({
    to: email,
    subject: 'LifeVault — Your Email Verification Code',
    html,
    text: `Your LifeVault verification code is ${otp}. It expires in 10 minutes.`,
  });
};

/** Send 6-digit OTP for password reset */
const sendPasswordResetOtpEmail = async (user, otp) => {
  const html = getPasswordResetOtpEmailHTML(user.name, otp);
  await sendEmail({
    to: user.email,
    subject: 'LifeVault — Your Password Reset Code',
    html,
    text: `Your LifeVault password reset code is ${otp}. It expires in 10 minutes.`,
  });
};

/** Welcome email after account creation */
const sendWelcomeEmail = async (user) => {
  const html = getWelcomeEmailHTML(user.name);
  await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to LifeVault!',
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
  sendWelcomeEmail,
};
