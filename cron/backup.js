const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Schedule database backup every day at 2 AM
cron.schedule('0 2 * * *', () => {
  const backupScript = path.join(__dirname, '../scripts/backup-db.js');
  
  exec(`node ${backupScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error}`);
      return;
    }
    console.log(`Backup stdout: ${stdout}`);
    if (stderr) {
      console.error(`Backup stderr: ${stderr}`);
    }
  });
});