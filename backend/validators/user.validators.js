/**
 * validators/user.validators.js — User account & settings validation
 */

const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const passwordStrengthRule = body('newPassword')
  .notEmpty()
  .withMessage('New password is required')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/)
  .withMessage(
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

const updateAccountRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s.-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and dots'),
  validate,
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordStrengthRule,
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validate,
];

const deleteAccountRules = [
  body('password').notEmpty().withMessage('Password is required to delete your account'),
  validate,
];

module.exports = {
  updateAccountRules,
  changePasswordRules,
  deleteAccountRules,
};
