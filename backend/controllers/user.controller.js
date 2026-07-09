/**
 * controllers/user.controller.js — Account & Settings Controllers
 *
 * Handles profile account settings: view/update account, change password,
 * and self-service account deletion.
 */

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { COOKIES } = require('../utils/constants');
const { deleteUserAndData } = require('../services/admin.service');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  profilePhoto: user.profilePhoto,
  createdAt: user.createdAt,
});

const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
};

exports.getMe = async (req, res, next) => {
  try {
    new ApiResponse(200, 'Account retrieved successfully', sanitizeUser(req.user)).send(res);
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  const { name } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    user.name = name;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'Account Updated',
      description: 'User updated their display name in account settings.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Account updated successfully', sanitizeUser(user)).send(res);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password +refreshToken');
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(ApiError.unauthorized('Current password is incorrect.'));
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'Password Changed',
      description: 'User changed their account password.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    clearRefreshCookie(res);

    new ApiResponse(200, 'Password changed successfully. Please sign in again.').send(res);
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Incorrect password. Account deletion cancelled.'));
    }

    const userEmail = user.email;
    await deleteUserAndData(user._id);

    clearRefreshCookie(res);

    new ApiResponse(200, `Account ${userEmail} deleted permanently.`).send(res);
  } catch (error) {
    next(error);
  }
};
