const express = require('express');
const router = express.Router();
const {
  register,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  setupAdmin
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Auth Endpoints
router.post('/register', register);
router.post('/verify-otp', verifyRegisterOtp);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Single-Admin Setup / Reset Endpoint (Master-key protected)
router.post('/admin/setup', setupAdmin);

// Authenticated User Endpoints
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('profilePic'), updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
