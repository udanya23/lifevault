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
const EmergencyContact = require('../models/EmergencyContact');
const HealthTimelineEvent = require('../models/HealthTimelineEvent');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { PAGINATION, ROLES } = require('../utils/constants');
const { deleteUserAndData } = require('../services/admin.service');
const { toCsv } = require('../utils/csv');

// ── Analytics ─────────────────────────────────────────────────────────────────

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      newUsersThisMonth,
      totalDocuments,
      totalScans,
      totalTimelineEvents,
      totalContacts,
      scansThisMonth,
      recentUsers,
      registrationTrend,
      documentsByType,
      scanTrend,
      recentScans,
      topActions,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.USER, isActive: true, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ role: ROLES.USER, createdAt: { $gte: thirtyDaysAgo } }),
      Document.countDocuments(),
      QRScan.countDocuments(),
      HealthTimelineEvent.countDocuments({ isDeleted: false }),
      EmergencyContact.countDocuments(),
      QRScan.countDocuments({ scannedAt: { $gte: thirtyDaysAgo } }),
      User.find({ role: ROLES.USER })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name email createdAt isEmailVerified isSuspended profilePhoto'),
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
      Document.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      QRScan.aggregate([
        { $match: { scannedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      QRScan.find()
        .sort({ scannedAt: -1 })
        .limit(6)
        .populate('userId', 'name email')
        .select('scannerArea scannedAt userId'),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const trend = registrationTrend.map((item) => ({
      label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count,
    }));

    // Fill missing days in the 7-day scan trend with zeros
    const scanMap = Object.fromEntries(scanTrend.map((d) => [d._id, d.count]));
    const scanTrendFilled = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      scanTrendFilled.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: key,
        count: scanMap[key] || 0,
      });
    }

    new ApiResponse(200, 'Analytics retrieved successfully', {
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        unverifiedUsers: Math.max(0, totalUsers - verifiedUsers),
        newUsersThisMonth,
        totalDocuments,
        totalScans,
        scansThisMonth,
        totalTimelineEvents,
        totalContacts,
      },
      recentUsers,
      registrationTrend: trend,
      documentsByType: documentsByType.map((d) => ({ type: d._id || 'other', count: d.count })),
      scanTrend: scanTrendFilled,
      recentScans,
      topActions: topActions.map((a) => ({ action: a._id, count: a.count })),
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
    const roleFilter = req.query.role || 'all';

    const query = {};
    if (roleFilter === 'admin') query.role = ROLES.ADMIN;
    else if (roleFilter === 'user') query.role = ROLES.USER;
    else query.role = { $in: [ROLES.USER, ROLES.ADMIN] };

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

// ── User Detail (drill-down) ─────────────────────────────────────────────────

exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name email role isEmailVerified isActive isSuspended createdAt updatedAt profilePhoto qrToken'
    );

    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    const [documentsCount, scansCount, timelineCount, contactsCount, lastActivity, recentLogs] =
      await Promise.all([
        Document.countDocuments({ userId: user._id }),
        QRScan.countDocuments({ userId: user._id }),
        HealthTimelineEvent.countDocuments({ userId: user._id, isDeleted: false }),
        EmergencyContact.countDocuments({ userId: user._id }),
        ActivityLog.findOne({ userId: user._id }).sort({ createdAt: -1 }).select('action createdAt'),
        ActivityLog.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(8)
          .select('action description createdAt ipAddress'),
      ]);

    new ApiResponse(200, 'User detail retrieved successfully', {
      user,
      stats: { documentsCount, scansCount, timelineCount, contactsCount },
      lastActivity,
      recentLogs,
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

// ── Update User Role (Promote / Demote) ──────────────────────────────────────

exports.updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (id === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot change your own role.'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    if (user.role === role) {
      return next(ApiError.badRequest(`User already has the ${role} role.`));
    }

    // Never allow the platform to end up without an administrator
    if (user.role === ROLES.ADMIN && role === ROLES.USER) {
      const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
      if (adminCount <= 1) {
        return next(
          ApiError.badRequest('Cannot demote the last administrator. Promote another admin first.')
        );
      }
    }

    const previousRole = user.role;
    user.role = role;

    // Revoke sessions so new permissions take effect on next login
    user.refreshToken = undefined;
    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Admin Role Update',
      description: `Admin changed role of ${user.email}: ${previousRole} → ${role}.`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, `User role updated to ${role}.`, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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

    const filter = {};
    const search = (req.query.search || '').trim();
    const action = (req.query.action || '').trim();

    if (action) filter.action = action;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ action: regex }, { description: regex }];
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    const [logs, total, actions] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      ActivityLog.countDocuments(filter),
      ActivityLog.distinct('action'),
    ]);

    new ApiResponse(200, 'Activity reports retrieved successfully', logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      actions: actions.sort(),
    }).send(res);
  } catch (error) {
    next(error);
  }
};

// ── CSV Exports ───────────────────────────────────────────────────────────────

const EXPORT_ROW_LIMIT = 10000;

const sendCsv = (res, filename, csv) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
};

const buildDateFilter = (req, field = 'createdAt') => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter[field] = {};
    if (req.query.from) filter[field].$gte = new Date(req.query.from);
    if (req.query.to) {
      const to = new Date(req.query.to);
      to.setHours(23, 59, 59, 999);
      filter[field].$lte = to;
    }
  }
  return filter;
};

const logExport = (req, what) =>
  ActivityLog.create({
    userId: req.user._id,
    action: 'Admin Data Export',
    description: `Admin exported ${what} as CSV.`,
    ipAddress: req.ip || 'Unknown',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });

/** GET /admin/export/users — all accounts as CSV */
exports.exportUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: [ROLES.USER, ROLES.ADMIN] } })
      .sort({ createdAt: -1 })
      .limit(EXPORT_ROW_LIMIT)
      .select('name email role isEmailVerified isActive isSuspended createdAt');

    const rows = users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isSuspended ? 'suspended' : u.isActive ? 'active' : 'inactive',
      emailVerified: u.isEmailVerified ? 'yes' : 'no',
      joined: u.createdAt?.toISOString(),
    }));

    const csv = toCsv(rows, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'emailVerified', label: 'Email Verified' },
      { key: 'joined', label: 'Joined At' },
    ]);

    await logExport(req, `${rows.length} user accounts`);
    sendCsv(res, `lifevault-users-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (error) {
    next(error);
  }
};

/** GET /admin/export/activity — activity logs as CSV (optional from/to) */
exports.exportActivity = async (req, res, next) => {
  try {
    const filter = buildDateFilter(req);
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(EXPORT_ROW_LIMIT)
      .populate('userId', 'name email');

    const rows = logs.map((log) => ({
      action: log.action,
      user: log.userId?.name || 'System',
      email: log.userId?.email || '',
      description: log.description,
      ipAddress: log.ipAddress,
      time: log.createdAt?.toISOString(),
    }));

    const csv = toCsv(rows, [
      { key: 'action', label: 'Action' },
      { key: 'user', label: 'User' },
      { key: 'email', label: 'Email' },
      { key: 'description', label: 'Description' },
      { key: 'ipAddress', label: 'IP Address' },
      { key: 'time', label: 'Time' },
    ]);

    await logExport(req, `${rows.length} activity log entries`);
    sendCsv(res, `lifevault-activity-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (error) {
    next(error);
  }
};

/** GET /admin/export/scans — QR scan history as CSV (optional from/to) */
exports.exportScans = async (req, res, next) => {
  try {
    const filter = buildDateFilter(req, 'scannedAt');
    const scans = await QRScan.find(filter)
      .sort({ scannedAt: -1 })
      .limit(EXPORT_ROW_LIMIT)
      .populate('userId', 'name email');

    const rows = scans.map((scan) => ({
      user: scan.userId?.name || 'Unknown',
      email: scan.userId?.email || '',
      location: scan.scannerArea || 'Unknown',
      ipAddress: scan.scannerIp,
      scannedAt: scan.scannedAt?.toISOString(),
    }));

    const csv = toCsv(rows, [
      { key: 'user', label: 'User' },
      { key: 'email', label: 'Email' },
      { key: 'location', label: 'Scanner Location' },
      { key: 'ipAddress', label: 'Scanner IP' },
      { key: 'scannedAt', label: 'Scanned At' },
    ]);

    await logExport(req, `${rows.length} QR scan records`);
    sendCsv(res, `lifevault-qr-scans-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (error) {
    next(error);
  }
};
