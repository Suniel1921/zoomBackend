const cron = require('node-cron');
const { Appointment } = require('../models');
const { sendEmailReminder, sendSMSReminder } = require('../utils/reminder');
const { addDays, isAfter, startOfDay } = require('date-fns');

// Schedule reminders check every hour
cron.schedule('0 * * * *', async () => {
  try {
    const tomorrow = addDays(startOfDay(new Date()), 1);
    
    // Find appointments for tomorrow that haven't sent reminders
    const appointments = await Appointment.findAll({
      where: {
        date: tomorrow,
        reminderSent: false,
        status: 'Scheduled'
      }
    });

    for (const appointment of appointments) {
      try {
        if (appointment.reminderType === 'email' || appointment.reminderType === 'both') {
          await sendEmailReminder(appointment);
        }
        
        if (appointment.reminderType === 'sms' || appointment.reminderType === 'both') {
          await sendSMSReminder(appointment);
        }

        // Mark reminder as sent
        await appointment.update({ reminderSent: true });
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Reminder cron error:', error);
  }
});