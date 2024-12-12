const backupCron = require('./backup');
const cleanupCron = require('./cleanup');
const reminderCron = require('./reminder');

// Export all cron jobs
module.exports = {
  backupCron,
  cleanupCron,
  reminderCron
};