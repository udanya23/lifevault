/**
 * controllers/admin.controller.js — Admin Panel Controllers
 *
 * Restricted to admin role via route middleware.
 * Provides user management, platform analytics, and activity reports.
 */

const User = require('../models/User');
const Document = require('../models/Document');
const QRScan = require('../models/QRScan');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { PAGINATION, ROLES } = require('../utils/constants');
const { deleteUserAndData } = require('../services/admin.service');

// ── Analytics ─────────────────────────────────────────────────────────────────

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      newUsersThisMonth,
      totalDocuments,
      totalScans,
      recentUsers,
      registrationTrend,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.USER, isActive: true, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ role: ROLES.USER, createdAt: { $gte: thirtyDaysAgo } }),
      Document.countDocuments(),
      QRScan.countDocuments(),
      User.find({ role: ROLES.USER })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt isEmailVerified isSuspended'),
      User.aggregate([
        {
          $match: {
            role: ROLES.USER,
            createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const trend = registrationTrend.map((item) => ({
      label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count,
    }));

    new ApiResponse(200, 'Analytics retrieved successfully', {
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        newUsersThisMonth,
        totalDocuments,
        totalScans,
      },
      recentUsers,
      registrationTrend: trend,
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── User List ─────────────────────────────────────────────────────────────────

exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';

    const query = { role: ROLES.USER };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'suspended') query.isSuspended = true;
    else if (status === 'active') {
      query.isActive = true;
      query.isSuspended = false;
    } else if (status === 'unverified') query.isEmailVerified = false;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email role isEmailVerified isActive isSuspended createdAt profilePhoto'),
      User.countDocuments(query),
    ]);

    new ApiResponse(200, 'Users retrieved successfully', users, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Update User Status (Suspend / Activate) ─────────────────────────────────

exports.updateUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { isSuspended, isActive } = req.body;

  try {
    if (id === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot modify your own account status.'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    if (user.role === ROLES.ADMIN) {
      return next(ApiError.forbidden('Admin accounts cannot be modified through this endpoint.'));
    }

    if (typeof isSuspended === 'boolean') user.isSuspended = isSuspended;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    // Revoke sessions when suspending
    if (isSuspended === true) {
      user.refreshToken = undefined;
    }

    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Admin User Status Update',
      description: `Admin updated user ${user.email}: suspended=${user.isSuspended}, active=${user.isActive}`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'User status updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      isSuspended: user.isSuspended,
      isActive: user.isActive,
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Delete User ───────────────────────────────────────────────────────────────

exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (id === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot delete your own account.'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    if (user.role === ROLES.ADMIN) {
      return next(ApiError.forbidden('Admin accounts cannot be deleted.'));
    }

    const userEmail = user.email;
    await deleteUserAndData(id);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Admin User Deleted',
      description: `Admin permanently deleted user account: ${userEmail}`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'User deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};

// ── Activity Reports ──────────────────────────────────────────────────────────

exports.getReports = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      ActivityLog.countDocuments(),
    ]);

    new ApiResponse(200, 'Activity reports retrieved successfully', logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }).send(res);
  } catch (error) {
    next(error);
  }
};
