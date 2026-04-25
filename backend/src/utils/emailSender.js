const nodemailer = require('nodemailer');

/**
 * Create a reusable Nodemailer transporter.
 * Uses SMTP settings from environment variables.
 * For development: use Ethereal (https://ethereal.email)
 * For production: use real SMTP (Gmail, SendGrid, etc.)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send an invite email for first-time password setup.
 * Called when Master creates a new shop admin.
 */
const sendInviteEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const link = `${FRONTEND_URL()}/set-password/${token}`;

  const mailOptions = {
    from: `"Agro Billing SaaS" <${process.env.SMTP_USER || 'noreply@agrobilling.com'}>`,
    to: email,
    subject: '🌾 Welcome! Set up your Agro Billing account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Welcome to Agro Billing! 🌾</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your shop admin account has been created. Please click the button below to set your password and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Set Your Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link expires in <strong>30 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you didn't expect this email, please ignore it.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Link not working? Copy and paste this URL: <br/>${link}</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Invite email sent:', info.messageId);

  // For Ethereal: log the preview URL so you can view the email
  if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};
/**
 * Send a password reset email.
 * Called from Master-triggered reset.
 */
const sendResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const link = `${FRONTEND_URL()}/reset-password/${token}`;

  const mailOptions = {
    from: `"Agro Billing SaaS" <${process.env.SMTP_USER || 'noreply@agrobilling.com'}>`,
    to: email,
    subject: '🔑 Reset your Agro Billing password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Password Reset Request 🔑</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link expires in <strong>15 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Link not working? Copy and paste this URL: <br/>${link}</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Reset email sent:', info.messageId);

  if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = { sendInviteEmail, sendResetEmail };
