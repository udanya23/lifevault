const router = require('express').Router();
const medicalController = require('../controllers/medical.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // protect all medical endpoints

router.get('/', medicalController.getMedicalInfo);
router.put('/', medicalController.updateMedicalInfo);

module.exports = router;
