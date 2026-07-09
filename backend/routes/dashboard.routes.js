const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, dashboardController.getDashboardData);

module.exports = router;
