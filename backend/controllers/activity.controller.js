/**
 * controllers/activity.controller.js — User Activity Log Controllers
 *
 * Returns paginated security audit logs and QR scan history
 * for the authenticated user only.
 */

const ActivityLog = require('../models/ActivityLog');
const QRScan = require('../models/QRScan');
const ApiResponse = require('../utils/ApiResponse');
const { PAGINATION } = require('../utils/constants');

exports.getActivityLogs = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const page = Math.max(parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(
      parseInt(req.query.limit) || 15,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('action description ipAddress userAgent createdAt'),
      ActivityLog.countDocuments({ userId }),
    ]);

    new ApiResponse(200, 'Activity logs retrieved successfully', logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }).send(res);
  } catch (error) {
    next(error);
  }
};

exports.getQRScans = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const page = Math.max(parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(
      parseInt(req.query.limit) || 15,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      QRScan.find({ userId })
        .sort({ scannedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('scannerIp scannerArea scannerCity scannerRegion scannerCountry userAgent scannedAt'),
      QRScan.countDocuments({ userId }),
    ]);

    new ApiResponse(200, 'QR scan history retrieved successfully', scans, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }).send(res);
  } catch (error) {
    next(error);
  }
};
