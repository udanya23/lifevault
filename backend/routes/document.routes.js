const router = require('express').Router();
const documentController = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');

router.use(protect); // protect all document routes

router.get('/', documentController.getDocuments);
router.post('/', uploadDocument, documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
