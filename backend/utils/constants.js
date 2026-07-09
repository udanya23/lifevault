/**
 * constants.js — App-wide backend constants
 *
 * Centralizing magic strings and numbers here means we change
 * them in one place and every module that imports them updates instantly.
 */

// ── User Roles ─────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

// ── Document Types ─────────────────────────────────────────────────────────
const DOCUMENT_TYPES = Object.freeze({
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'drivingLicense',
  INSURANCE: 'insurance',
  MEDICAL_REPORT: 'medicalReport',
});

// ── Blood Groups ────────────────────────────────────────────────────────────
const BLOOD_GROUPS = Object.freeze(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

// ── Gender Options ──────────────────────────────────────────────────────────
const GENDERS = Object.freeze(['male', 'female', 'other', 'prefer_not_to_say']);

// ── Activity Log Actions ────────────────────────────────────────────────────
const ACTIVITY_ACTIONS = Object.freeze({
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFIED: 'email_verified',
  PROFILE_UPDATE: 'profile_update',
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_DELETE: 'document_delete',
  QR_GENERATED: 'qr_generated',
  QR_SCANNED: 'qr_scanned',
  ACCOUNT_DELETED: 'account_deleted',
});

// ── Upload Config ────────────────────────────────────────────────────────────
const UPLOAD = Object.freeze({
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDERS: {
    PROFILE_PHOTOS: 'lifevault/profile-photos',
    DOCUMENTS: 'lifevault/documents',
  },
});

// ── Cookie Names ─────────────────────────────────────────────────────────────
const COOKIES = Object.freeze({
  REFRESH_TOKEN: 'refreshToken',
});

// ── Pagination Defaults ───────────────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

// ── Token Expiry (ms) ─────────────────────────────────────────────────────────
const TOKEN_EXPIRY = Object.freeze({
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,   // 24 hours
  PASSWORD_RESET: 15 * 60 * 1000,             // 15 minutes
});

// ── OTP Config ──────────────────────────────────────────────────────────────
const OTP = Object.freeze({
  EXPIRY_MS: 10 * 60 * 1000,        // 10 minutes
  RESEND_COOLDOWN_MS: 60 * 1000,    // 1 minute between resends
  BCRYPT_ROUNDS: 10,
  LENGTH: 6,
});

module.exports = {
  ROLES,
  DOCUMENT_TYPES,
  BLOOD_GROUPS,
  GENDERS,
  ACTIVITY_ACTIONS,
  UPLOAD,
  COOKIES,
  PAGINATION,
  TOKEN_EXPIRY,
  OTP,
};
