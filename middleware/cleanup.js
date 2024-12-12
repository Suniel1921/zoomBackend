const fs = require('fs').promises;
const path = require('path');

// Cleanup old temporary files
const cleanupMiddleware = async (req, res, next) => {
  try {
    const uploadsDir = process.env.UPLOAD_DIR;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Get all files in uploads directory
    const files = await fs.readdir(uploadsDir);
    const now = Date.now();

    // Check each file
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);

      // Delete files older than maxAge
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }

  next();
};

module.exports = cleanupMiddleware;