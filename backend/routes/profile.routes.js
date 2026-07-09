const router = require('express').Router();
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadProfilePhoto } = require('../middleware/upload.middleware');

router.use(protect); // protect all profile endpoints

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/photo', uploadProfilePhoto, profileController.updateProfilePhoto);

module.exports = router;
