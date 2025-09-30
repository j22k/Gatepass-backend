const nodemailer = require('nodemailer');

// Debug: Log environment variables
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);

// Create transporter with SMTP settings from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 465,  // Changed to 465 for Gmail SSL
  secure: process.env.SMTP_SECURE === 'true' || true,  // Force true for Gmail SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true,  // Enable debug logging
});

// Email templates
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

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@gatepass.com',
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    // Note: Do not throw error to avoid blocking API response
  }
};

// Specific functions for approval/rejection
const sendApprovalEmail = async (visitorEmail, visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime) => {
  const subject = 'Your Visitor Request Has Been Approved';
  const html = getApprovalTemplate(visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime);
  await sendEmail(visitorEmail, subject, html);
};

const sendRejectionEmail = async (visitorEmail, visitorName, trackingCode, reason) => {
  const subject = 'Your Visitor Request Has Been Rejected';
  const html = getRejectionTemplate(visitorName, trackingCode, reason);
  await sendEmail(visitorEmail, subject, html);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
