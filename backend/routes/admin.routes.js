/**
 * routes/admin.routes.js — Admin Panel Routes
 *
 * All routes require authentication + admin role.
 */

const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');
const {
  updateStatusRules,
  getUsersQuery,
  getReportsQuery,
  userIdParam,
} = require('../validators/admin.validators');

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', getUsersQuery, adminController.getUsers);
router.get('/users/:id', userIdParam, adminController.getUserDetail);
router.patch('/users/:id/status', updateStatusRules, adminController.updateUserStatus);
router.delete('/users/:id', userIdParam, adminController.deleteUser);
router.get('/reports', getReportsQuery, adminController.getReports);

module.exports = router;
