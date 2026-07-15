/**
 * validators/admin.validators.js — Admin endpoint validation rules
 */

const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const userIdParam = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  validate,
];

const updateStatusRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isSuspended').optional().isBoolean().withMessage('isSuspended must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  validate,
];

const getUsersQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['all', 'active', 'suspended', 'unverified'])
    .withMessage('Invalid status filter'),
  validate,
];

const getReportsQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 120 }).withMessage('Search query too long'),
  query('action').optional().trim().isLength({ max: 80 }).withMessage('Action filter too long'),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  validate,
];

module.exports = {
  userIdParam,
  updateStatusRules,
  getUsersQuery,
  getReportsQuery,
};
