// Core
const nodemailer = require("nodemailer");

// Utilities
const logger = require("./logger");

// === Email Template Builder ===
const buildEmailTemplate = ({
  firstName,
  title,
  message,
  otp = null,
  buttonText = null,
  buttonLink = null,
  footerNote = null,
}) => {
  const year = new Date().getFullYear();
  const expiryMinutes = process.env.OTP_EXPIRES_IN_MINUTES || 10;
  const appName = process.env.FROM_NAME || "App Platform";
  const greeting = firstName ? `Hi ${firstName},` : "";

  const otpBlock = otp
    ? `
      <div style="text-align:center;margin:20px 0;">
        <span style="display:inline-block;background:#4CAF50;color:#fff;font-size:24px;padding:10px 24px;border-radius:6px;letter-spacing:4px;font-weight:bold;">
          ${otp}
        </span>
      </div>
      <p style="text-align:center;">This OTP is valid for <strong>${expiryMinutes} minutes</strong>.</p>
    `
    : "";

  const buttonBlock =
    buttonText && buttonLink
      ? `
      <div style="text-align:center;margin:30px 0;">
        <a href="${buttonLink}" style="background-color:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;">
          ${buttonText}
        </a>
      </div>
    `
      : "";

  const finalFooterNote =
    footerNote ||
    "If you didn’t initiate this request, you can safely ignore this email.";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          padding: 20px !important;
        }
        .email-content {
          padding: 20px !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;margin:20px auto;">
            <tr>
              <td class="email-content" style="padding:30px;">
                <h2 style="color:#333;font-size:24px;margin-bottom:10px;">${title}</h2>
                <p style="margin:0 0 10px;">${greeting}</p>
                <p style="margin:0 0 20px;">${message}</p>
                ${otpBlock}
                ${buttonBlock}
                <p style="color:#555;font-size:14px;">${finalFooterNote}</p>
                <p style="margin-top:30px;font-size:14px;">Regards,<br><strong>${appName}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="background:#f4f4f4;padding:20px;text-align:center;font-size:12px;color:#777;border-top:1px solid #ddd;">
                &copy; ${year} ${appName}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

// === Transport Creator ===
const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// === General-purpose Email Sender ===
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport();
  const isDev = process.env.NODE_ENV === "development";

  try {
    // Send from the authenticated SMTP account: providers like Gmail
    // drop/spam-folder mail whose sender domain they don't authenticate.
    const fromAddress = process.env.SMTP_USER || process.env.FROM_EMAIL;
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${fromAddress}>`,
      replyTo: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (!info.accepted?.length) {
      throw new Error(`Recipient rejected: ${info.rejected?.join(", ")}`);
    }

    return { isEmailSent: true };
  } catch (err) {
    if (isDev) {
      console.error("Email sending failed:", err.stack || err);
    } else {
      logger.error("Email sending failed", {
        message: err.message,
        code: err.code,
        name: err.name,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      isEmailSent: false,
      message: isDev
        ? err.message || "Failed to send email"
        : "Failed to send email. Please try again later.",
    };
  }
};

// === Specific Email APIs ===

const sendRegistrationOtpEmail = async ({ user, otp }) => {
  if (!user?.email || !otp) throw new Error("Missing user or OTP");

  if (process.env.NODE_ENV === "development") {
    logger.info(`🔑 [dev] OTP for ${user.email}: ${otp}`);
  }

  const html = buildEmailTemplate({
    firstName: user.firstName || "there",
    title: "Verify Your Email",
    message:
      "To verify your email and create your account, please use the OTP below:",
    otp,
  });

  return sendEmail({
    to: user.email,
    subject: "Email Verification OTP",
    html,
  });
};

const sendPasswordResetEmail = async ({ user, passwordResetUrl }) => {
  if (!user?.email || !user.passwordResetToken || !passwordResetUrl)
    throw new Error("Missing user, password reset URL, or token");

  const html = buildEmailTemplate({
    firstName: user.firstName,
    title: "Forgot Your Password?",
    message:
      "We received a request to reset your password. Click the button below to reset it.",
    buttonText: "Reset Password",
    buttonLink: passwordResetUrl,
  });

  return sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html,
  });
};

const sendGuideWelcomeEmail = async ({ user, tempPassword }) => {
  if (!user?.email) {
    throw new Error("Missing user email");
  }

  const html = buildEmailTemplate({
    firstName: user.firstName || "there",
    title: "Welcome to GoGuided!",
    message: tempPassword
      ? `
      Your application has been approved. You're now registered as a <strong>Guide</strong> on our platform.<br /><br />
      Here is your temporary password: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code><br /><br />
      Use it to log in and complete your profile.<br />
      <strong>Please change your password after logging in for security.</strong>
    `
      : `
      Your application has been approved. You're now registered as a <strong>Guide</strong> on our platform.<br /><br />
      You can now log in with your existing credentials to access your dashboard and complete your profile.<br />
      <strong>If you face any issues, please contact support.</strong>
    `,
  });

  return sendEmail({
    to: user.email,
    subject: "Your GoGuided Account is Ready",
    html,
  });
};

const sendAdminWelcomeEmail = async ({ user, tempPassword }) => {
  if (!user?.email) {
    throw new Error("Missing user email");
  }

  const html = buildEmailTemplate({
    firstName: user.firstName || "Admin",
    title: "Welcome to the Admin Panel",
    message: tempPassword
      ? `
      You've been added as an <strong>Admin</strong> on our platform.<br /><br />
      Your temporary password is: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code><br /><br />
      Use it to log in and access the admin dashboard.<br />
      <strong>Please change your password after logging in.</strong>
    `
      : `
      You've been added as an <strong>Admin</strong> on our platform.<br /><br />
      You can now log in using your existing credentials.<br />
      <strong>If you face any issues, please contact support.</strong>
    `,
    footerNote: "If this wasn't you, please contact support immediately.",
  });

  return sendEmail({
    to: user.email,
    subject: "Your Admin Access is Ready",
    html,
  });
};

const sendCustomEmailService = async ({ user, subject, message }) => {
  const html = buildEmailTemplate({
    firstName: user.firstName,
    title: subject,
    message,
    footerNote: "This is an automated email. Please do not reply.",
  });

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendFeedbackResolvedEmail = async ({ user, message }) => {
  if (!user?.email) {
    throw new Error("Missing user email");
  }

  const html = buildEmailTemplate({
    firstName: user.firstName || "User",
    title: "Your Feedback Has Been Resolved",
    message: message
      ? `
      We have reviewed your feedback and taken necessary action.<br /><br />
      <strong>Message from our team:</strong><br />
      <blockquote style="background: #f9fafb; padding: 10px; border-left: 4px solid #3b82f6; border-radius: 4px;">
        ${message}
      </blockquote>
      Thank you for helping us improve our platform!
    `
      : `
      We have reviewed your feedback and taken necessary action.<br /><br />
      Thank you for helping us improve our platform!
    `,
    footerNote:
      "If you have further concerns, feel free to reply to this email.",
  });

  return sendEmail({
    to: user.email,
    subject: "Your Feedback Has Been Resolved",
    html,
  });
};

module.exports = {
  sendRegistrationOtpEmail,
  sendPasswordResetEmail,
  sendGuideWelcomeEmail,
  sendAdminWelcomeEmail,
  sendFeedbackResolvedEmail,
  sendCustomEmailService,
};
