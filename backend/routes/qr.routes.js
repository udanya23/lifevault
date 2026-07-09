const router = require('express').Router();
const qrController = require('../controllers/qr.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', qrController.getMyQR);
router.post('/regenerate', qrController.regenerateQR);

module.exports = router;
