const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from server root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

// Helper to parse CLI arguments (e.g. --email=myadmin@glamora.com --password=secret)
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (arg) return arg.substring(prefix.length).trim();
  return fallback;
};

const seedSingleAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glamora';
    console.log('🔄 Connecting to MongoDB for Single-Admin configuration...');
    
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB successfully.');

    // Desired Admin Credentials
    const adminEmail = (getArg('email', process.env.ADMIN_EMAIL) || 'admin@glamora.com').toLowerCase().trim();
    const adminPassword = getArg('password', process.env.ADMIN_PASSWORD) || 'AdminPassword123!';
    const adminName = getArg('name', process.env.ADMIN_NAME) || 'Glamora Admin';
    const adminPhone = getArg('phone', process.env.ADMIN_PHONE) || '+1 555-0199';

    // 1. Check for existing admin in MongoDB
    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      console.log(`ℹ️ Existing Admin record found (_id: ${admin._id}, current email: ${admin.email}).`);
      console.log(`🔄 Updating existing Admin credentials...`);
      admin.name = adminName;
      admin.email = adminEmail;
      admin.phone = adminPhone;
      admin.password = adminPassword; // pre-save will re-hash with bcrypt
      admin.isVerified = true;
      admin.otp = null;
      admin.otpExpiry = null;
      await admin.save();
      console.log(`✅ Single Admin account successfully updated.`);
    } else {
      // Check if user already exists with target email
      const existingUser = await User.findOne({ email: adminEmail });
      if (existingUser) {
        console.log(`ℹ️ User found with email ${adminEmail}. Promoting account to Single Admin...`);
        existingUser.name = adminName;
        existingUser.phone = adminPhone;
        existingUser.password = adminPassword;
        existingUser.role = 'admin';
        existingUser.isVerified = true;
        existingUser.otp = null;
        existingUser.otpExpiry = null;
        await existingUser.save();
        admin = existingUser;
        console.log(`✅ Promoted account to Single Admin.`);
      } else {
        console.log(`🌱 Creating new Single Admin account (${adminEmail})...`);
        admin = await User.create({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          password: adminPassword,
          role: 'admin',
          isVerified: true
        });
        console.log(`✅ Single Admin account created successfully.`);
      }
    }

    // 2. Enforce strict Single-Admin architecture (clean up any duplicate admin entries)
    const duplicateAdmins = await User.deleteMany({
      role: 'admin',
      _id: { $ne: admin._id }
    });

    if (duplicateAdmins.deletedCount > 0) {
      console.log(`🧹 Removed ${duplicateAdmins.deletedCount} redundant admin accounts to enforce single-admin architecture.`);
    }

    // 3. Verify password comparison with bcrypt
    const testAdmin = await User.findById(admin._id);
    const passMatches = await testAdmin.comparePassword(adminPassword);
    if (!passMatches) {
      throw new Error('Verification failed: Password comparison with bcrypt returned false.');
    }

    console.log('\n======================================================');
    console.log('👑 GLAMORA SINGLE ADMIN CONFIGURED SUCCESSFULLY');
    console.log('======================================================');
    console.log(`   Name:     ${testAdmin.name}`);
    console.log(`   Email:    ${testAdmin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${testAdmin.role}`);
    console.log(`   Verified: ${testAdmin.isVerified}`);
    console.log(`   Bcrypt:   Verified (isMatch = true)`);
    console.log('======================================================');
    console.log('👉 You can now log into the Admin portal with these credentials.');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed Single Admin:', error.message);
    process.exit(1);
  }
};

seedSingleAdmin();
