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

    // Single-Admin Protection: Admin email cannot be registered or overwritten publicly
    if (existingUser && existingUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This email is reserved for administration. Please use Admin Login.'
      });
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      // User registered before but didn't verify OTP; update record - strictly customer role
      existingUser.name = name.trim();
      existingUser.phone = phone.trim();
      existingUser.password = password; // pre-save will hash
      existingUser.role = 'customer';
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // Create new unverified user - strictly customer role
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
 * @desc    Verify credentials, validate role boundaries, and issue JWT token directly
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      console.warn('[Auth Login] Failed: Email and password are required.');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Auth Login] Login attempt for: '${normalizedEmail}'${role ? ` [Role requested: ${role}]` : ''}`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.warn(`[Auth Login] Failed: User not found with email '${normalizedEmail}'.`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[Auth Login] Failed: Password mismatch for user '${normalizedEmail}'.`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Role boundary validation if role is specified by login mode
    if (role && user.role !== role) {
      console.warn(`[Auth Login] Role mismatch for '${normalizedEmail}'. Stored role: '${user.role}', attempted portal: '${role}'.`);
      if (role === 'admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This account does not possess administrator privileges.'
        });
      }
      if (role === 'customer' && user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Administrator account detected. Please use the Admin Login portal.'
        });
      }
    }

    if (!user.isVerified) {
      console.warn(`[Auth Login] Failed: Account '${normalizedEmail}' is not yet verified.`);
      return res.status(403).json({
        success: false,
        message: 'Account is not yet verified. Please complete registration verification.'
      });
    }

    // Direct JWT Token generation
    const token = generateToken(user._id, user.role);
    console.log(`[Auth Login] Success: User '${user.email}' authenticated successfully as [${user.role}].`);

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
    console.error('[Auth Login] Server Error:', error);
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

    const { name, phone, email, password } = req.body;
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      // Check if new email is already in use by another user
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
      }
      user.email = normalizedEmail;
    }

    // Support optional direct password update from profile form if provided
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
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
    console.log(`[Auth Profile] Profile updated for: ${user.email} (${user.role})`);

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
    console.log(`[Auth Password] Password changed successfully for: ${user.email}`);

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

/**
 * @route   POST /api/auth/admin/setup
 * @desc    Master-key protected endpoint to create or update the single admin account
 */
const setupAdmin = async (req, res) => {
  try {
    const { setupKey, name, email, password, phone } = req.body;
    const masterKey = process.env.ADMIN_SETUP_KEY || 'glamora_master_setup_key_2026';

    const providedKey = setupKey || req.headers['x-admin-setup-key'];
    if (providedKey !== masterKey) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Invalid master setup key.'
      });
    }

    const adminEmail = (email || 'admin@glamora.com').toLowerCase().trim();
    const adminPassword = password || 'AdminPassword123!';
    const adminName = (name || 'Glamora Admin').trim();
    const adminPhone = (phone || '+1 555-0199').trim();

    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      admin.name = adminName;
      admin.email = adminEmail;
      admin.phone = adminPhone;
      admin.password = adminPassword;
      admin.isVerified = true;
      admin.otp = null;
      admin.otpExpiry = null;
      await admin.save();
      console.log(`[Admin Setup] Single admin account updated: ${admin.email}`);
    } else {
      const existingUser = await User.findOne({ email: adminEmail });
      if (existingUser) {
        existingUser.role = 'admin';
        existingUser.name = adminName;
        existingUser.phone = adminPhone;
        existingUser.password = adminPassword;
        existingUser.isVerified = true;
        existingUser.otp = null;
        existingUser.otpExpiry = null;
        await existingUser.save();
        admin = existingUser;
        console.log(`[Admin Setup] User promoted to single admin: ${admin.email}`);
      } else {
        admin = await User.create({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          password: adminPassword,
          role: 'admin',
          isVerified: true
        });
        console.log(`[Admin Setup] Single admin account created: ${admin.email}`);
      }
    }

    // Guarantee that strictly one admin exists
    await User.deleteMany({ role: 'admin', _id: { $ne: admin._id } });

    res.status(200).json({
      success: true,
      message: 'Single Admin account configured and verified successfully.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Setup Admin Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error setting up admin.'
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
  changePassword,
  setupAdmin
};
