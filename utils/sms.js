const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return response;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

const smsTemplates = {
  // Appointment reminder SMS
  async sendAppointmentReminder(appointment, client) {
    const message = `Reminder: You have an appointment for ${appointment.type} on ${appointment.date} at ${appointment.time}. ${
      appointment.meetingType === 'physical' 
        ? `Location: ${appointment.location}`
        : `Meeting Link: ${appointment.meetingLink}`
    }`;
    return sendSMS(client.phone, message);
  },

  // Payment reminder SMS
  async sendPaymentReminder(client, amount, dueDate) {
    const message = `Payment Reminder: You have a pending payment of ¥${amount.toLocaleString()} due on ${dueDate}. Please process the payment to avoid any delays.`;
    return sendSMS(client.phone, message);
  },

  // Document status SMS
  async sendDocumentStatusSMS(client, status, documentType) {
    const message = `Your ${documentType} has been ${status}. Please check your email for more details.`;
    return sendSMS(client.phone, message);
  }
};

module.exports = smsTemplates;