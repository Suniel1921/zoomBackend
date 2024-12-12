const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Schedule cleanup every day at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    const uploadsDir = process.env.UPLOAD_DIR;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    const files = await fs.readdir(uploadsDir);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});