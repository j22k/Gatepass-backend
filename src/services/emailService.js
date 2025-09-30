const nodemailer = require('nodemailer');

// Create transporter with SMTP settings from environment variables
// Note: In production, ensure SMTP credentials are securely stored and rotated.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Remove debug in production; enable only for development
  // debug: process.env.NODE_ENV === 'development',
});

// Email templates
/**
 * Generates HTML template for approval email.
 * @param {string} visitorName - Name of the visitor.
 * @param {string} trackingCode - Unique tracking code.
 * @param {string} warehouseName - Name of the warehouse.
 * @param {string} timeSlotName - Name of the time slot.
 * @param {string} date - Visit date.
 * @param {string} fromTime - Start time.
 * @param {string} toTime - End time.
 * @returns {string} HTML email content.
 */
const getApprovalTemplate = (visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime) => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { color: #28a745; text-align: center; }
        p { line-height: 1.6; }
        ul { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
        li { margin-bottom: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Visitor Request Approved</h2>
        <p>Dear ${visitorName},</p>
        <p>Your visitor request has been <strong style="color: #28a745;">approved</strong>.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Tracking Code:</strong> ${trackingCode}</li>
          <li><strong>Warehouse:</strong> ${warehouseName}</li>
          <li><strong>Time Slot:</strong> ${timeSlotName} (${fromTime} - ${toTime})</li>
          <li><strong>Date:</strong> ${date}</li>
        </ul>
        <p>Please arrive on time. Contact us if you have any questions.</p>
        <div class="footer">
          <p>Best regards,<br>GatePass Team</p>
        </div>
      </div>
    </body>
  </html>
`;

/**
 * Generates HTML template for rejection email.
 * @param {string} visitorName - Name of the visitor.
 * @param {string} trackingCode - Unique tracking code.
 * @param {string} reason - Reason for rejection.
 * @returns {string} HTML email content.
 */
const getRejectionTemplate = (visitorName, trackingCode, reason = 'No specific reason provided') => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { color: #dc3545; text-align: center; }
        p { line-height: 1.6; }
        .details { background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 5px solid #dc3545; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Visitor Request Rejected</h2>
        <p>Dear ${visitorName},</p>
        <p>We regret to inform you that your visitor request has been <strong style="color: #dc3545;">rejected</strong>.</p>
        <div class="details">
          <p><strong>Tracking Code:</strong> ${trackingCode}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>You may submit a new request if applicable. Contact us for more details.</p>
        <div class="footer">
          <p>Best regards,<br>GatePass Team</p>
        </div>
      </div>
    </body>
  </html>
`;

/**
 * Sends an email asynchronously.
 * @param {string} to - Recipient email.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content.
 * @returns {Promise<void>} Resolves when email is sent or logs error.
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters');
    }
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@gatepass.com',
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    // Log success only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Email sent to ${to}`);
    }
  } catch (error) {
    // Log error without exposing sensitive info
    console.error('Email sending failed:', error.message);
    // Do not throw to avoid blocking API response
  }
};

/**
 * Sends approval email to visitor.
 * @param {string} visitorEmail - Visitor's email.
 * @param {string} visitorName - Visitor's name.
 * @param {string} trackingCode - Tracking code.
 * @param {string} warehouseName - Warehouse name.
 * @param {string} timeSlotName - Time slot name.
 * @param {string} date - Visit date.
 * @param {string} fromTime - Start time.
 * @param {string} toTime - End time.
 */
const sendApprovalEmail = async (visitorEmail, visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime) => {
  const subject = 'Your Visitor Request Has Been Approved';
  const html = getApprovalTemplate(visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime);
  await sendEmail(visitorEmail, subject, html);
};

/**
 * Sends rejection email to visitor.
 * @param {string} visitorEmail - Visitor's email.
 * @param {string} visitorName - Visitor's name.
 * @param {string} trackingCode - Tracking code.
 * @param {string} reason - Rejection reason.
 */
const sendRejectionEmail = async (visitorEmail, visitorName, trackingCode, reason) => {
  const subject = 'Your Visitor Request Has Been Rejected';
  const html = getRejectionTemplate(visitorName, trackingCode, reason);
  await sendEmail(visitorEmail, subject, html);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
