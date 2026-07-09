/**
 * routes/activity.routes.js — User Activity Log Routes
 */

const router = require('express').Router();
const activityController = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');
const { paginationQuery } = require('../validators/activity.validators');

router.use(protect);

router.get('/logs', paginationQuery, activityController.getActivityLogs);
router.get('/scans', paginationQuery, activityController.getQRScans);

module.exports = router;
