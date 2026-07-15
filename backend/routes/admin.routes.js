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
  updateRoleRules,
  getUsersQuery,
  getReportsQuery,
  exportQuery,
  userIdParam,
} = require('../validators/admin.validators');

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', getUsersQuery, adminController.getUsers);
router.get('/users/:id', userIdParam, adminController.getUserDetail);
router.patch('/users/:id/status', updateStatusRules, adminController.updateUserStatus);
router.patch('/users/:id/role', updateRoleRules, adminController.updateUserRole);
router.delete('/users/:id', userIdParam, adminController.deleteUser);
router.get('/reports', getReportsQuery, adminController.getReports);

// CSV exports
router.get('/export/users', adminController.exportUsers);
router.get('/export/activity', exportQuery, adminController.exportActivity);
router.get('/export/scans', exportQuery, adminController.exportScans);

module.exports = router;
