const User = require('../models/User');
const { sendOtpEmail } = require('../config/email');
const { generateToken } = require('../middleware/auth');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/auth/register
 * @desc    Start registration by sending OTP to email
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, phone, password).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      // User registered before but didn't verify OTP; update record
      existingUser.name = name.trim();
      existingUser.phone = phone.trim();
      existingUser.password = password; // pre-save will hash
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // Create new unverified user
      existingUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
        role: 'customer',
        otp,
        otpExpiry,
        isVerified: false
      });
    }

    // Send OTP via email (with console fallback)
    const emailResult = await sendOtpEmail(normalizedEmail, otp, 'Registration Verification');

    res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email. Please verify to complete registration.',
      email: normalizedEmail,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for registration and activate account
 */
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registration record found for this email.'
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found. Please request a new code.'
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check your code and try again.'
      });
    }

    // Activate user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to Glamora.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Verify Register OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during verification.'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Verify credentials and send 2FA OTP to registered email
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account is not yet verified. Please complete registration verification.'
      });
    }

    // Generate 2FA Login OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, 'Login 2-Step Verification');

    res.status(200).json({
      success: true,
      requireOtp: true,
      message: 'Credentials verified! OTP has been sent to your registered email.',
      email: user.email,
      role: user.role,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

/**
 * @route   POST /api/auth/verify-login-otp
 * @desc    Verify 2FA OTP and issue JWT token
 */
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No login request found. Please login again.'
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.'
      });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please try again.'
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification.'
    });
  }
};

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for registration, login, or password reset
 */
const resendOtp = async (req, res) => {
  try {
    const { email, type = 'Verification' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email.'
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, type);

    res.status(200).json({
      success: true,
      message: `A new OTP has been sent to ${user.email}.`,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while resending OTP.'
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, 'Password Reset');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      email: user.email,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset request.'
    });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verify OTP and set new password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset request. Please request a new OTP.'
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new code.'
      });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code.'
      });
    }

    // Set new password (pre-save hook hashes it)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error resetting password.'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile & photo (Cloudinary / local upload)
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, email } = req.body;
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      // Check if new email is already in use
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
      }
      user.email = email.toLowerCase().trim();
    }

    // Handle file upload if present
    if (req.file) {
      let imageUrl = null;
      if (isCloudinaryConfigured) {
        imageUrl = await uploadToCloudinary(req.file.path, 'profiles');
        // Clean up temp file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      if (imageUrl) {
        user.profilePic = imageUrl;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.'
    });
  }
};

/**
 * @route   PUT /api/change-password
 * @desc    Change password with old password verification
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password.'
    });
  }
};

module.exports = {
  register,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
};
