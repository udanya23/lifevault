/**
 * validators/activity.validators.js — Activity log query validation
 */

const { query } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = { paginationQuery };
