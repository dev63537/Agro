const nodemailer = require('nodemailer');

/**
 * Create a reusable Nodemailer transporter.
 * Used for local development/fallback.
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
 * Generic email sending wrapper that tries Resend first,
 * then Brevo HTTPS API, and falls back to Nodemailer SMTP.
 */
const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;

  console.log(`📧 sendEmail wrapper invoked for recipient: ${toEmail}`);
  console.log(`[Diagnostics] RESEND_API_KEY present: ${resendApiKey ? 'YES (length: ' + resendApiKey.trim().length + ')' : 'NO'}`);
  console.log(`[Diagnostics] BREVO_API_KEY present: ${brevoApiKey ? 'YES (length: ' + brevoApiKey.trim().length + ')' : 'NO'}`);
  console.log(`[Diagnostics] SMTP_USER present: ${process.env.SMTP_USER ? 'YES' : 'NO'}`);

  // Find all keys in environment containing 'brevo', 'resend', 'api', or 'key' to detect typos/spaces
  const matchingEnvKeys = Object.keys(process.env).filter(k => 
    k.toLowerCase().includes("brevo") || 
    k.toLowerCase().includes("resend") || 
    k.toLowerCase().includes("api") || 
    k.toLowerCase().includes("key")
  );
  console.log(`[Diagnostics] Env keys matching 'brevo/resend/api/key':`, matchingEnvKeys);

  // 1. TRY RESEND HTTPS API
  if (resendApiKey && resendApiKey.trim()) {
    const activeKey = resendApiKey.trim().replace(/^["']|["']$/g, "");
    console.log(`[Diagnostics] Cleaned Resend key length: ${activeKey.length}`);
    console.log(`📧 Attempting email delivery to ${toEmail} via Resend HTTP API...`);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Agro Billing SaaS <onboarding@resend.dev>',
          to: [toEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Resend HTTP error status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log(`📧 Email delivered via Resend API successfully. Message ID: ${data.id}`);
      return { messageId: data.id };
    } catch (resendErr) {
      console.error('📧 Resend API delivery failed. Attempting next fallback...', resendErr);
    }
  }

  // 2. TRY BREVO HTTPS API
  if (brevoApiKey && brevoApiKey.trim()) {
    // Strip any leading/trailing quotes that might have been copied from a .env file
    const activeKey = brevoApiKey.trim().replace(/^["']|["']$/g, "");
    
    // Print a safe preview to inspect the key prefix and suffix for correctness
    const prefix = activeKey.substring(0, 8);
    const suffix = activeKey.length > 12 ? activeKey.substring(activeKey.length - 4) : "";
    console.log(`[Diagnostics] Cleaned Brevo key length: ${activeKey.length}`);
    console.log(`[Diagnostics] Safe Brevo Key Preview: ${prefix}...${suffix}`);
    
    console.log(`📧 Attempting email delivery to ${toEmail} via Brevo HTTP API...`);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': activeKey,
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Agro Billing SaaS',
            email: process.env.SMTP_USER || 'noreply@agrobilling.com',
          },
          to: [
            {
              email: toEmail,
              name: toName || toEmail,
            },
          ],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brevo HTTP error status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log(`📧 Email delivered via Brevo API successfully. Message ID: ${data.messageId}`);
      return { messageId: data.messageId };
    } catch (brevoErr) {
      console.error('📧 Brevo API delivery failed. Attempting SMTP fallback...', brevoErr);
    }
  }

  // 3. FALLBACK / LOCAL DEVELOPMENT: SMTP via Nodemailer
  console.log(`⚠️ No active Email API Key found or API delivery failed. Falling back to SMTP.`);
  console.log(`📧 Attempting email delivery to ${toEmail} via SMTP...`);
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Agro Billing SaaS" <${process.env.SMTP_USER || 'noreply@agrobilling.com'}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Email sent via SMTP:', info.messageId);

  // For Ethereal: log the preview URL so you can view the email
  if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

/**
 * Send an invite email for first-time password setup.
 * Called when Master creates a new shop admin.
 */
const sendInviteEmail = async (email, name, token) => {
  const link = `${FRONTEND_URL()}/set-password/${token}`;

  const htmlContent = `
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
  `;

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: '🌾 Welcome! Set up your Agro Billing account',
    htmlContent,
  });
};

/**
 * Send a password reset email.
 * Called from Master-triggered reset.
 */
const sendResetEmail = async (email, name, token) => {
  const link = `${FRONTEND_URL()}/reset-password/${token}`;

  const htmlContent = `
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
  `;

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: '🔑 Reset your Agro Billing password',
    htmlContent,
  });
};

/**
 * Send subscription expiry warning email.
 * Called automatically 7 days before expiry.
 */
const sendExpiryWarningEmail = async (email, shopName, expiryDate) => {
  const dateStr = new Date(expiryDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const FRONTEND = FRONTEND_URL();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Subscription Expiring Soon</h1>
      </div>
      <p>Hi <strong>${shopName}</strong>,</p>
      <p>Your <strong>Agro Billing</strong> subscription is expiring in <strong style="color:#d97706;">7 days</strong> on <strong>${dateStr}</strong>.</p>
      <p>After expiry, your shop will be suspended and you will not be able to create new bills or access reports.</p>
      <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:8px; padding:16px; margin: 20px 0;">
        <strong>What happens if I don't renew?</strong>
        <ul style="margin: 8px 0; padding-left: 20px; color:#92400e;">
          <li>New billing will be blocked</li>
          <li>Existing data is safe and preserved</li>
          <li>You can renew anytime to restore access</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND}" 
           style="background-color: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          Renew Now →
        </a>
      </div>
      <p style="color: #666; font-size: 13px;">Contact your administrator to renew your subscription before <strong>${dateStr}</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">This is an automated reminder from Agro Billing SaaS. Shop: ${shopName}</p>
    </div>
  `;

  return sendEmail({
    toEmail: email,
    toName: shopName,
    subject: `⚠️ Your Agro Billing subscription expires on ${dateStr}`,
    htmlContent,
  });
};

module.exports = { sendInviteEmail, sendResetEmail, sendExpiryWarningEmail };
