// const fs = require('fs').promises;
// const path = require('path');
// const mongoose = require('mongoose');
// const cron = require('node-cron');
// require('dotenv').config();

// let scheduledTask = null;
// let latestBackupFile = null;
// let currentIntervalDays = null; // New variable to store the interval

// exports.createBackup = async () => {
//   try {
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     const backupData = {};

//     for (const collection of collections) {
//       const data = await mongoose.connection.db.collection(collection.name).find({}).toArray();
//       backupData[collection.name] = data;
//     }

//     const backupsDir = path.join(__dirname, '..', 'backups');
//     await fs.mkdir(backupsDir, { recursive: true });

//     const timestamp = Date.now();
//     const backupFileName = `backup-${timestamp}.json`;
//     const backupFilePath = path.join(backupsDir, backupFileName);

//     await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

//     latestBackupFile = { path: backupFilePath, name: backupFileName };

//     return backupFileName;
//   } catch (error) {
//     console.error('Error creating backup:', error);
//     throw error;
//   }
// };

// exports.handleManualBackup = async (req, res) => {
//   try {
//     await exports.createBackup();
//     res.setHeader('Content-Disposition', `attachment; filename=${latestBackupFile.name}`);
//     res.setHeader('Content-Type', 'application/json');
//     res.sendFile(latestBackupFile.path, async (err) => {
//       if (err) {
//         console.error('Error sending file:', err);
//         return res.status(500).json({ error: 'Failed to send backup file.' });
//       }
//       await fs.unlink(latestBackupFile.path);
//       latestBackupFile = null;
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create backup.' });
//   }
// };

// exports.getLatestBackup = (req, res) => {
//   if (!latestBackupFile) {
//     return res.status(404).json({ message: 'No recent backup available.' });
//   }

//   res.setHeader('Content-Disposition', `attachment; filename=${latestBackupFile.name}`);
//   res.setHeader('Content-Type', 'application/json');
//   res.sendFile(latestBackupFile.path, async (err) => {
//     if (err) {
//       console.error('Error sending file:', err);
//       return res.status(500).json({ error: 'Failed to send backup file.' });
//     }
//     await fs.unlink(latestBackupFile.path);
//     latestBackupFile = null;
//   });
// };

// exports.restoreBackup = async (req, res) => {
//   try {
//     const { data } = req.body;
//     if (!data || typeof data !== 'object') {
//       return res.status(400).json({ error: 'Invalid backup data.' });
//     }

//     for (const collectionName in data) {
//       const collectionData = data[collectionName];
//       const collection = mongoose.connection.db.collection(collectionName);

//       await collection.drop().catch((err) => {
//         if (err.codeName !== 'NamespaceNotFound') throw err;
//       });

//       if (collectionData?.length > 0) {
//         await collection.insertMany(collectionData);
//       }
//     }

//     res.status(200).json({ message: 'Data restored successfully!' });
//   } catch (error) {
//     console.error('Error restoring backup:', error);
//     res.status(500).json({ error: 'Failed to restore backup.' });
//   }
// };

// exports.scheduleBackup = (req, res) => {
//   const { intervalDays } = req.body;

//   if (!intervalDays || isNaN(intervalDays) || intervalDays < 1) {
//     return res.status(400).json({ error: 'Invalid interval days.' });
//   }

//   if (scheduledTask) {
//     scheduledTask.stop();
//     scheduledTask = null;
//   }

//   scheduledTask = cron.schedule(`0 0 */${intervalDays} * *`, async () => {
//     try {
//       console.log(`Scheduled backup running every ${intervalDays} days...`);
//       await exports.createBackup();
//       console.log('Scheduled backup completed. File ready for download.');
//     } catch (error) {
//       console.error('Scheduled backup failed:', error);
//     }
//   }, { scheduled: true });

//   currentIntervalDays = intervalDays; // Store the interval

//   res.status(200).json({ message: `Backup scheduled every ${intervalDays} days.`, intervalDays });
// };

// exports.stopScheduledBackup = (req, res) => {
//   if (scheduledTask) {
//     scheduledTask.stop();
//     scheduledTask = null;
//     currentIntervalDays = null; // Clear the interval
//     res.status(200).json({ message: 'Scheduled backup stopped.' });
//   } else {
//     res.status(200).json({ message: 'No scheduled backup was active.' });
//   }
// };

// exports.getScheduleStatus = (req, res) => {
//   try {
//     if (scheduledTask) {
//       return res.status(200).json({ isScheduled: true, intervalDays: currentIntervalDays });
//     }
//     res.status(200).json({ isScheduled: false, intervalDays: null });
//   } catch (error) {
//     console.error('Error in getScheduleStatus:', error);
//     res.status(500).json({ error: 'Failed to retrieve schedule status.' });
//   }
// }



const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

let scheduledTask = null;
let latestBackupFile = null;
let currentIntervalDays = null;

exports.createBackup = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    for (const collection of collections) {
      const data = await mongoose.connection.db.collection(collection.name).find({}).toArray();
      backupData[collection.name] = data;
    }

    const backupsDir = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupsDir, { recursive: true });

    const timestamp = Date.now();
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(backupsDir, backupFileName);

    await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

    latestBackupFile = { path: backupFilePath, name: backupFileName };

    return backupFileName;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

exports.handleManualBackup = async (req, res) => {
  try {
    await exports.createBackup();
    res.setHeader('Content-Disposition', `attachment; filename=${latestBackupFile.name}`);
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(latestBackupFile.path, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ error: 'Failed to send backup file.' });
      }
      await fs.unlink(latestBackupFile.path);
      latestBackupFile = null;
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create backup.' });
  }
};

exports.getLatestBackup = (req, res) => {
  if (!latestBackupFile) {
    return res.status(404).json({ message: 'No recent backup available.' });
  }

  res.setHeader('Content-Disposition', `attachment; filename=${latestBackupFile.name}`);
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(latestBackupFile.path, async (err) => {
    if (err) {
      console.error('Error sending file:', err);
      return res.status(500).json({ error: 'Failed to send backup file.' });
    }
    await fs.unlink(latestBackupFile.path);
    latestBackupFile = null;
  });
};

exports.restoreBackup = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid backup data.' });
    }

    for (const collectionName in data) {
      const collectionData = data[collectionName];
      const collection = mongoose.connection.db.collection(collectionName);

      await collection.drop().catch((err) => {
        if (err.codeName !== 'NamespaceNotFound') throw err;
      });

      if (collectionData?.length > 0) {
        await collection.insertMany(collectionData);
      }
    }

    res.status(200).json({ message: 'Data restored successfully!' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup.' });
  }
};

exports.scheduleBackup = (req, res) => {
  const { intervalDays } = req.body;

  if (!intervalDays || isNaN(intervalDays) || intervalDays < 1) {
    return res.status(400).json({ error: 'Invalid interval days.' });
  }

  // If the interval has changed or no task exists, re-schedule
  if (!scheduledTask || currentIntervalDays !== intervalDays) {
    if (scheduledTask) {
      scheduledTask.stop();
      scheduledTask = null;
    }

    scheduledTask = cron.schedule(`0 0 */${intervalDays} * *`, async () => {
      try {
        console.log(`Scheduled backup running every ${intervalDays} days...`);
        await exports.createBackup();
        console.log('Scheduled backup completed. File ready for download.');
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, { scheduled: true });

    currentIntervalDays = intervalDays; // Update the stored interval
  }

  res.status(200).json({ message: `Backup scheduled every ${intervalDays} days.`, intervalDays });
};

exports.stopScheduledBackup = (req, res) => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    currentIntervalDays = null;
    res.status(200).json({ message: 'Scheduled backup stopped.' });
  } else {
    res.status(200).json({ message: 'No scheduled backup was active.' });
  }
};

exports.getScheduleStatus = (req, res) => {
  try {
    if (scheduledTask) {
      return res.status(200).json({ isScheduled: true, intervalDays: currentIntervalDays });
    }
    res.status(200).json({ isScheduled: false, intervalDays: null });
  } catch (error) {
    console.error('Error in getScheduleStatus:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule status.' });
  }
};