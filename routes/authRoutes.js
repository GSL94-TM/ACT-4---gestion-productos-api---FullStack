const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validateRegisterData,
  validateLoginData
} = require('../middlewares/validationMiddleware');

router.post('/register', validateRegisterData, authController.register);
router.post('/login', validateLoginData, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;