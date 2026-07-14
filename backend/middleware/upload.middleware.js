/**
 * middleware/upload.middleware.js — Multer Upload Middleware Configuration
 *
 * Configures Multer storage engines and file size limits for:
 * 1. Profile Photo uploads (restricted to images, max 2MB)
 * 2. Secure Document uploads (restricted to images + PDFs, max 5MB)
 *
 * Implements strict type checking and custom error responses.
 */

const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { profilePhotoStorage, documentStorage, timelineStorage } = require('../config/cloudinary');

// ── Profile Photo Upload Configuration ────────────────────────────────────────

const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept image formats
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(
        new ApiError(400, 'Invalid file type. Only JPG, PNG, and WEBP images are allowed.'),
        false
      );
    }
  },
}).single('profilePhoto'); // Field name must match 'profilePhoto' in the form

// Wrapper to handle Multer specific errors (e.g. limit exceeded) and forward to express error handler
const uploadProfilePhoto = (req, res, next) => {
  profilePhotoUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File too large. Maximum size allowed is 2MB.'));
      }
      return next(ApiError.badRequest(err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// ── Secure Document Upload Configuration ──────────────────────────────────────

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';

    if (isImage || isPDF) {
      cb(null, true);
    } else {
      cb(
        new ApiError(400, 'Invalid file type. Only PDFs and JPG/PNG/WEBP images are allowed.'),
        false
      );
    }
  },
}).single('documentFile'); // Field name must match 'documentFile' in the form

const uploadDocument = (req, res, next) => {
  documentUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File too large. Maximum size allowed is 5MB.'));
      }
      return next(ApiError.badRequest(err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// ── Timeline attachment uploads (up to 5 files per request) ─────────────────

const timelineUpload = multer({
  storage: timelineStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';
    if (isImage || isPDF) {
      cb(null, true);
    } else {
      cb(
        new ApiError(400, 'Invalid file type. Only PDFs and JPG/PNG/WEBP images are allowed.'),
        false
      );
    }
  },
}).array('timelineFiles', 5);

const uploadTimelineFiles = (req, res, next) => {
  timelineUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File too large. Maximum size allowed is 5MB.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(ApiError.badRequest('Too many files. Maximum 5 attachments per upload.'));
      }
      return next(ApiError.badRequest(err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadProfilePhoto,
  uploadDocument,
  uploadTimelineFiles,
};
