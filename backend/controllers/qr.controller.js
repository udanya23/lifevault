/**
 * controllers/qr.controller.js — QR Code Management
 *
 * Provides authenticated users their QR token, emergency URL,
 * scan analytics, and optional token regeneration.
 */

const crypto = require('crypto');
const User = require('../models/User');
const QRScan = require('../models/QRScan');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Ensure user has a qrToken (backfill for accounts created before QR module).
 */
const ensureQrToken = async (user) => {
  if (user.qrToken) return user.qrToken;

  user.qrToken = crypto.randomBytes(16).toString('hex');
  await user.save();
  return user.qrToken;
};

const buildEmergencyUrl = (qrToken) => {
  // Prefer explicit frontend URL for QR links.
  // Fallback to CLIENT_URL, then sensible local default.
  const configuredUrl =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:5173';

  let baseUrl = configuredUrl.replace(/\/+$/, '');

  // Safety fallback: if CLIENT_URL was set to backend port accidentally,
  // use Vite dev server port so scans open the UI page, not raw JSON.
  if (!process.env.FRONTEND_URL && /:5000$/.test(baseUrl)) {
    baseUrl = baseUrl.replace(':5000', ':5173');
  }

  return `${baseUrl}/emergency/${qrToken}`;
};

exports.getMyQR = async (req, res, next) => {
  try {
    const qrToken = await ensureQrToken(req.user);
    const emergencyUrl = buildEmergencyUrl(qrToken);

    const [totalScans, recentScans] = await Promise.all([
      QRScan.countDocuments({ userId: req.user._id }),
      QRScan.find({ userId: req.user._id })
        .sort({ scannedAt: -1 })
        .limit(5)
        .select('scannedAt scannerIp'),
    ]);

    new ApiResponse(200, 'QR data retrieved successfully', {
      qrToken,
      emergencyUrl,
      totalScans,
      recentScans,
      visibleFields: ['name', 'bloodGroup', 'emergencyContacts', 'allergies', 'currentMedicines'],
      hiddenFields: ['address', 'email', 'documents', 'medicalNotes', 'password'],
    }).send(res);
  } catch (error) {
    next(error);
  }
};

exports.regenerateQR = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    user.qrToken = crypto.randomBytes(16).toString('hex');
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'QR Code Regenerated',
      description: 'User regenerated their emergency QR code. Previous links are now invalid.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'QR code regenerated successfully', {
      qrToken: user.qrToken,
      emergencyUrl: buildEmergencyUrl(user.qrToken),
    }).send(res);
  } catch (error) {
    next(error);
  }
};
