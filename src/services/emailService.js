const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

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
 * Generates HTML template for approval email with QR code and Google Calendar link.
 * @param {string} visitorName - Name of the visitor.
 * @param {string} trackingCode - Unique tracking code.
 * @param {string} warehouseName - Name of the warehouse.
 * @param {string} timeSlotName - Name of the time slot.
 * @param {string} date - Visit date (YYYY-MM-DD).
 * @param {string} fromTime - Start time (HH:MM:SS).
 * @param {string} toTime - End time (HH:MM:SS).
 * @returns {Object} Object with html and attachments.
 */
const getApprovalTemplate = async (visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime) => {
  // Generate QR code as PNG buffer
  const qrCodeBuffer = await QRCode.toBuffer(trackingCode, { type: 'png' });
  const qrCodeAttachment = {
    filename: 'qrcode.png',
    content: qrCodeBuffer,
    cid: 'qrcode@cid'  // Content-ID for embedding
  };

  // Generate Google Calendar URL
  const [year, month, day] = date.split('-').map(Number);
  const [startHour, startMin] = fromTime.split(':').map(Number);
  const [endHour, endMin] = toTime.split(':').map(Number);
  const startDateTime = new Date(year, month - 1, day, startHour, startMin);
  const endDateTime = new Date(year, month - 1, day, endHour, endMin);
  const startISO = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endISO = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Visitor+Appointment+at+${encodeURIComponent(warehouseName)}&dates=${startISO}/${endISO}&details=Tracking+Code:+${encodeURIComponent(trackingCode)}&location=${encodeURIComponent(warehouseName)}`;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h2 { color: #28a745; text-align: center; }
          p { line-height: 1.6; }
          ul { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
          li { margin-bottom: 5px; }
          .qr-code { text-align: center; margin: 20px 0; }
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
          <div class="qr-code">
            <p>Scan this QR code for quick access:</p>
            <img src="cid:qrcode@cid" alt="QR Code for Tracking Code" />
          </div>
          <p>Add to Google Calendar: <a href="${googleCalendarUrl}" target="_blank">Add Event</a></p>
          <p>Please arrive on time. Contact us if you have any questions.</p>
          <div class="footer">
            <p>Best regards,<br>GatePass Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { html, attachments: [qrCodeAttachment] };
};

/**
 * Generates HTML template for rejection email with QR code.
 * @param {string} visitorName - Name of the visitor.
 * @param {string} trackingCode - Unique tracking code.
 * @param {string} reason - Reason for rejection.
 * @returns {Object} Object with html and attachments.
 */
const getRejectionTemplate = async (visitorName, trackingCode, reason = 'No specific reason provided') => {
  // Generate QR code as PNG buffer
  const qrCodeBuffer = await QRCode.toBuffer(trackingCode, { type: 'png' });
  const qrCodeAttachment = {
    filename: 'qrcode.png',
    content: qrCodeBuffer,
    cid: 'qrcode@cid'  // Content-ID for embedding
  };

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h2 { color: #dc3545; text-align: center; }
          p { line-height: 1.6; }
          .details { background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 5px solid #dc3545; }
          .qr-code { text-align: center; margin: 20px 0; }
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
          <div class="qr-code">
            <p>Scan this QR code for quick access:</p>
            <img src="cid:qrcode@cid" alt="QR Code for Tracking Code" />
          </div>
          <p>You may submit a new request if applicable. Contact us for more details.</p>
          <div class="footer">
            <p>Best regards,<br>GatePass Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { html, attachments: [qrCodeAttachment] };
};

/**
 * Sends an email asynchronously with attachments.
 * @param {string} to - Recipient email.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content.
 * @param {Array} attachments - Attachments (e.g., QR code).
 * @returns {Promise<void>} Resolves when email is sent or logs error.
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters');
    }
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@gatepass.com',
      to,
      subject,
      html,
      attachments,
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
 * Sends approval email to visitor with QR code and Google Calendar link.
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
  const { html, attachments } = await getApprovalTemplate(visitorName, trackingCode, warehouseName, timeSlotName, date, fromTime, toTime);
  await sendEmail(visitorEmail, subject, html, attachments);
};

/**
 * Sends rejection email to visitor with QR code.
 * @param {string} visitorEmail - Visitor's email.
 * @param {string} visitorName - Visitor's name.
 * @param {string} trackingCode - Tracking code.
 * @param {string} reason - Rejection reason.
 */
const sendRejectionEmail = async (visitorEmail, visitorName, trackingCode, reason) => {
  const subject = 'Your Visitor Request Has Been Rejected';
  const { html, attachments } = await getRejectionTemplate(visitorName, trackingCode, reason);
  await sendEmail(visitorEmail, subject, html, attachments);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
