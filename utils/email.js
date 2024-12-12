const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Load email template
const loadTemplate = async (templateName) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const template = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Send email
const sendEmail = async ({ to, subject, template, context }) => {
  try {
    // Load and compile template
    const compiledTemplate = await loadTemplate(template);
    const html = compiledTemplate(context);

    // Send mail
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html
    });

    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email
  sendWelcomeEmail <boltAction type="file" filePath="server/utils/email.js">  // Welcome email
  async sendWelcomeEmail(user) {
    return sendEmail({
      to: user.email,
      subject: 'Welcome to Zoom Creatives',
      template: 'welcome',
      context: {
        name: user.name,
        loginUrl: `${process.env.APP_URL}/login`
      }
    });
  },

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    return sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl: `${process.env.APP_URL}/reset-password/${resetToken}`
      }
    });
  },

  // Appointment reminder email
  async sendAppointmentReminder(appointment, client) {
    return sendEmail({
      to: client.email,
      subject: 'Appointment Reminder',
      template: 'appointment-reminder',
      context: {
        name: client.name,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        location: appointment.meetingType === 'physical' ? appointment.location : appointment.meetingLink
      }
    });
  },

  // Document verification email
  async sendDocumentVerificationEmail(client, document) {
    return sendEmail({
      to: client.email,
      subject: 'Document Verification Status',
      template: 'document-verification',
      context: {
        name: client.name,
        documentName: document.name,
        status: document.status,
        message: document.status === 'rejected' ? document.rejectionReason : 'Your document has been verified successfully.'
      }
    });
  }
};

module.exports = emailTemplates;