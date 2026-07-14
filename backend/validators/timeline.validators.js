/**
 * validators/timeline.validators.js — Health Timeline validation rules
 */

const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { TIMELINE_CATEGORIES } = require('../utils/constants');

const categoryValues = Object.values(TIMELINE_CATEGORIES);

const listTimelineQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Invalid year filter'),
  query('category').optional().isIn(categoryValues).withMessage('Invalid category filter'),
  query('search').optional().trim().isLength({ max: 120 }).withMessage('Search query too long'),
  validate,
];

const timelineIdParam = [
  param('id').isMongoId().withMessage('Invalid timeline event id'),
  validate,
];

const attachmentIdParam = [
  param('id').isMongoId().withMessage('Invalid timeline event id'),
  param('attachmentId').isMongoId().withMessage('Invalid attachment id'),
  validate,
];

const createTimelineBody = [
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('category').isIn(categoryValues).withMessage('Invalid category'),
  body('eventType').optional().trim().isLength({ max: 120 }),
  body('doctor').optional().trim().isLength({ max: 120 }),
  body('hospital').optional().trim().isLength({ max: 160 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('notes').optional().trim().isLength({ max: 4000 }),
  validate,
];

const updateTimelineBody = [
  body('eventDate').optional().isISO8601().withMessage('Invalid event date'),
  body('category').optional().isIn(categoryValues).withMessage('Invalid category'),
  body('eventType').optional().trim().isLength({ max: 120 }),
  body('doctor').optional().trim().isLength({ max: 120 }),
  body('hospital').optional().trim().isLength({ max: 160 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('notes').optional().trim().isLength({ max: 4000 }),
  validate,
];

module.exports = {
  listTimelineQuery,
  timelineIdParam,
  attachmentIdParam,
  createTimelineBody,
  updateTimelineBody,
};
