/**
 * routes/timeline.routes.js — Health Timeline routes
 */

const router = require('express').Router();
const timelineController = require('../controllers/timeline.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadTimelineFiles } = require('../middleware/upload.middleware');
const {
  listTimelineQuery,
  timelineIdParam,
  attachmentIdParam,
  createTimelineBody,
  updateTimelineBody,
} = require('../validators/timeline.validators');

router.use(protect);

router.get('/years', timelineController.getAvailableYears);
router.get('/', listTimelineQuery, timelineController.listEvents);
router.get('/:id', timelineIdParam, timelineController.getEventById);
router.post('/', uploadTimelineFiles, createTimelineBody, timelineController.createEvent);
router.put('/:id', timelineIdParam, uploadTimelineFiles, updateTimelineBody, timelineController.updateEvent);
router.delete('/:id', timelineIdParam, timelineController.deleteEvent);
router.delete('/:id/attachments/:attachmentId', attachmentIdParam, timelineController.deleteAttachment);

module.exports = router;
