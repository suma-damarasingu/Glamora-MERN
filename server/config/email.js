const nodemailer = require('nodemailer');

const isEmailConfigured = Boolean(
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== 'your_email@gmail.com'
);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Send an OTP email to the specified address
 * @param {string} email
 * @param {string} otp
 * @param {string} type - 'Registration' | 'Login Verification' | 'Password Reset'
 */
const sendOtpEmail = async (email, otp, type = 'Verification') => {
  const subject = `Glamora - ${type} OTP: ${otp}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #fce7f3; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.08);">
      <div style="background: linear-gradient(135deg, #e11d48, #be123c, #fb7185); padding: 32px 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: 700;">GLAMORA</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Luxury Beauty & Salon Experience</p>
      </div>
      <div style="padding: 32px 28px; color: #334155;">
        <h2 style="margin-top: 0; font-size: 20px; color: #0f172a; text-align: center;">${type}</h2>
        <p style="font-size: 15px; line-height: 1.6; text-align: center; color: #64748b;">
          Please use the following One-Time Password (OTP) to complete your ${type.toLowerCase()}. This code is valid for <strong>10 minutes</strong>.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <span style="display: inline-block; background: #fff1f2; color: #e11d48; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; border-radius: 12px; border: 2px dashed #fda4af;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 0;">
          If you did not request this OTP, please ignore this email or contact support.
        </p>
      </div>
      <div style="background-color: #fdf2f8; padding: 16px; text-align: center; font-size: 12px; color: #9d174d; border-top: 1px solid #fce7f3;">
        © ${new Date().getFullYear()} Glamora Beauty Services. All rights reserved.
      </div>
    </div>
  `;

  console.log(`\n==================================================`);
  console.log(`🌸 [GLAMORA OTP] To: ${email}`);
  console.log(`🔑 Purpose: ${type}`);
  console.log(`👉 OTP Code: [ ${otp} ]`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`==================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Glamora Beauty" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent
      });
      return { success: true, sent: true };
    } catch (error) {
      console.warn(`⚠️ Nodemailer error (logged to console instead): ${error.message}`);
      return { success: true, sent: false, error: error.message, devOtp: otp };
    }
  }

  return { success: true, sent: false, devOtp: otp };
};

module.exports = {
  sendOtpEmail
};
