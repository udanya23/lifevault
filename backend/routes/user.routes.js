/**
 * routes/user.routes.js — User Account & Settings Routes
 */

const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  updateAccountRules,
  changePasswordRules,
  deleteAccountRules,
} = require('../validators/user.validators');

router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', updateAccountRules, userController.updateAccount);
router.patch('/me/password', changePasswordRules, userController.changePassword);
router.delete('/me', deleteAccountRules, userController.deleteAccount);

module.exports = router;
