const express = require('express');

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Đăng ký / Đăng nhập thường
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);

// Google OAuth
router.post('/google', authController.googleAuth);
router.post('/google/complete', authController.googleRegisterComplete);

// Quên mật khẩu (3 bước)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtpHandler);
router.post('/reset-password', authController.resetPassword);

// Đổi mật khẩu từ Profile (yêu cầu đăng nhập)
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;