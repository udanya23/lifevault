const router = require('express').Router();
const emergencyContactController = require('../controllers/emergencyContact.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // protect all emergency contact endpoints

router.get('/', emergencyContactController.getContacts);
router.post('/', emergencyContactController.createContact);
router.put('/:id', emergencyContactController.updateContact);
router.delete('/:id', emergencyContactController.deleteContact);

module.exports = router;
