/**
 * routes/emergency.routes.js — Public Emergency Page Route
 *
 * Mounted at /emergency (NOT /api/v1/) for short QR URLs.
 * Rate-limited to prevent enumeration and abuse.
 */

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const emergencyController = require('../controllers/emergency.controller');

const emergencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many emergency page requests. Please try again later.',
  },
});

router.get('/:qrToken', emergencyLimiter, emergencyController.getEmergencyInfo);

// Called by the emergency page after browser GPS resolves — updates activity log location
router.patch('/:qrToken/location', emergencyLimiter, emergencyController.updateScanLocation);

module.exports = router;
