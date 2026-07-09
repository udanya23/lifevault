/**
 * config/email.js — Nodemailer transporter & template engine
 *
 * Strategy:
 * - Development: Mailtrap (catches all emails, nothing hits real inboxes)
 * - Production: SendGrid SMTP (just change .env values — no code change needed)
 *
 * We export a single `sendEmail` function that all services use.
 * Email templates are HTML strings generated inline — clean and dependency-free.
 */

const nodemailer = require('nodemailer');

/**
 * Create and cache the Nodemailer transporter.
 * The same transporter is reused across all email sends (connection pooling).
 */
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  // Gmail App Password flow (same as job-portal mail.js)
  if (process.env.EMAIL_SERVICE === 'gmail' || (!process.env.EMAIL_HOST && emailUser && emailPass)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    // `secure: true` uses SSL/TLS (port 465). `false` uses STARTTLS (port 587).
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Production pool settings — reuse connections instead of creating new ones
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// Singleton — created once and reused
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Core email sending function.
 * All email sends go through this single point — easy to mock in tests.
 *
 * @param {object} options
 * @param {string} options.to       - Recipient email address
 * @param {string} options.subject  - Email subject
 * @param {string} options.html     - HTML email body
 * @param {string} [options.text]   - Plain-text fallback (accessibility)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'LifeVault'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    // If no plain text provided, strip HTML tags as a simple fallback
    text: text || html.replace(/<[^>]*>/g, ''),
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      // In development with Mailtrap, log the preview URL
      console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// ── Email HTML Template Helpers ────────────────────────────────────────────────

/**
 * Wrap any email content in the standard LifeVault HTML email shell.
 * Uses inline styles for maximum email client compatibility.
 */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LifeVault</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                🔐 LifeVault
              </h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Your life. One secure vault.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} LifeVault. All rights reserved.<br>
                If you didn't request this email, please ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generate the email verification email HTML.
 *
 * @param {string} name             - User's first name
 * @param {string} verificationUrl  - Full URL with token
 */
const getVerificationEmailHTML = (name, verificationUrl) => {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
      Welcome to LifeVault, ${name}! 👋
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
      Thank you for creating your account. Please verify your email address to activate your vault and get started.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
      <tr>
        <td style="background:#2563eb;border-radius:8px;padding:0;">
          <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
            ✅ Verify My Email
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:14px;">
      Or paste this link in your browser:
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${verificationUrl}" style="color:#2563eb;font-size:13px;">${verificationUrl}</a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      This link expires in <strong>24 hours</strong>.
    </p>
  `);
};

/**
 * Generate the password reset email HTML.
 *
 * @param {string} name       - User's first name
 * @param {string} resetUrl   - Full URL with reset token
 */
const getPasswordResetEmailHTML = (name, resetUrl) => {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
      Reset Your Password 🔑
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
      Hi ${name}, we received a request to reset your LifeVault password.
      Click the button below to set a new password.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
      <tr>
        <td style="background:#2563eb;border-radius:8px;padding:0;">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
            🔐 Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:14px;">
      Or paste this link in your browser:
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${resetUrl}" style="color:#2563eb;font-size:13px;">${resetUrl}</a>
    </p>
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-top:8px;">
      <p style="margin:0;color:#92400e;font-size:13px;">
        ⚠️ This link expires in <strong>15 minutes</strong>. If you didn't request this, your account is safe — just ignore this email.
      </p>
    </div>
  `);
};

/**
 * Registration OTP email HTML.
 */
const getRegistrationOtpEmailHTML = (nameOrEmail, otp) => {
  const greeting = nameOrEmail?.includes('@') ? 'there' : nameOrEmail;
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
      Verify your email 📧
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
      Hi ${greeting}, use the code below to verify your email and continue creating your LifeVault account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:12px;color:#2563eb;background:#eff6ff;padding:20px 32px;border-radius:12px;border:2px dashed #93c5fd;">
        ${otp}
      </span>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
      This code expires in <strong>10 minutes</strong>. Never share it with anyone.
    </p>
  `);
};

/**
 * Password reset OTP email HTML.
 */
const getPasswordResetOtpEmailHTML = (name, otp) => {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
      Password Reset Code 🔑
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
      Hi ${name}, use this code to reset your LifeVault password.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:12px;color:#2563eb;background:#eff6ff;padding:20px 32px;border-radius:12px;border:2px dashed #93c5fd;">
        ${otp}
      </span>
    </div>
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
      <p style="margin:0;color:#92400e;font-size:13px;">
        ⚠️ Expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.
      </p>
    </div>
  `);
};

/**
 * Welcome email after successful registration.
 */
const getWelcomeEmailHTML = (name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return emailWrapper(`
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
      Welcome to LifeVault, ${name}! 🎉
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
      Your account is ready. Start building your secure emergency vault — add medical info, contacts, and your QR code.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background:#2563eb;border-radius:8px;">
          <a href="${clientUrl}/dashboard" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `);
};

module.exports = {
  sendEmail,
  getVerificationEmailHTML,
  getPasswordResetEmailHTML,
  getRegistrationOtpEmailHTML,
  getPasswordResetOtpEmailHTML,
  getWelcomeEmailHTML,
};
