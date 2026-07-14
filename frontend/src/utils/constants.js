/**
 * utils/constants.js — Frontend App Constants
 *
 * Mirrors the backend constants where needed on the frontend.
 * All magic strings in one place.
 */

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── User Roles ─────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

// ── Blood Groups ────────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ── Gender Options ──────────────────────────────────────────────────────────
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// ── Document Types ─────────────────────────────────────────────────────────
export const DOCUMENT_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card', icon: 'FaIdCard' },
  { value: 'pan', label: 'PAN Card', icon: 'FaIdCard' },
  { value: 'passport', label: 'Passport', icon: 'FaPassport' },
  { value: 'drivingLicense', label: 'Driving License', icon: 'FaCar' },
  { value: 'insurance', label: 'Insurance', icon: 'FaShieldAlt' },
  { value: 'medicalReport', label: 'Medical Report', icon: 'FaFileMedical' },
];

// ── Relationship Types (for emergency contacts) ────────────────────────────
export const RELATIONSHIP_TYPES = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Friend',
  'Doctor', 'Guardian', 'Other',
];

// ── File Upload ────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf',
];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── Health Timeline ─────────────────────────────────────────────────────────
export const TIMELINE_CATEGORIES = [
  { value: 'doctor_visit', label: 'Doctor Visit', color: 'blue' },
  { value: 'prescription', label: 'Prescription', color: 'indigo' },
  { value: 'surgery', label: 'Surgery', color: 'red' },
  { value: 'vaccination', label: 'Vaccination', color: 'emerald' },
  { value: 'lab_test', label: 'Lab Test', color: 'cyan' },
  { value: 'scan', label: 'Scan', color: 'violet' },
  { value: 'hospital_admission', label: 'Hospital Admission', color: 'orange' },
  { value: 'medication', label: 'Medication', color: 'teal' },
  { value: 'insurance', label: 'Insurance', color: 'amber' },
  { value: 'emergency_record', label: 'Emergency Record', color: 'rose' },
];

export const getTimelineCategoryMeta = (value) =>
  TIMELINE_CATEGORIES.find((c) => c.value === value) || {
    value,
    label: value,
    color: 'slate',
  };

// ── Routes ─────────────────────────────────────────────────────────────────
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_OTP: '/verify-otp',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  QR_CODE: '/qr-code',
  SETTINGS: '/settings',
  ACTIVITY: '/activity',
  TIMELINE: '/timeline',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
});

// ── Toast Config ────────────────────────────────────────────────────────────
export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};
