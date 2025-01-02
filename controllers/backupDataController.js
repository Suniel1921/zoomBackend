// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');

// // Backup Function
// exports.createBackup = async (req, res) => {
//   try {
//     // Get all collections in the database
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     const backupData = {};

//     // Fetch data from all collections
//     for (const collection of collections) {
//       const data = await mongoose.connection.db
//         .collection(collection.name)
//         .find({})
//         .toArray();
//       backupData[collection.name] = data;
//     }

//     // Ensure the backups directory exists
//     const backupsDir = path.join(__dirname, '..', 'backups');
//     if (!fs.existsSync(backupsDir)) {
//       fs.mkdirSync(backupsDir);
//     }

//     // Generate the backup file path
//     const backupFilePath = path.join(backupsDir, `backup-${Date.now()}.json`);

//     // Write backup data to a file
//     fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

//     // Send the backup file as a downloadable response
//     res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
//     res.setHeader('Content-Type', 'application/json');
//     res.sendFile(backupFilePath, (err) => {
//       if (err) {
//         console.error('Error sending file:', err);
//         res.status(500).send({ error: 'Failed to send backup file.' });
//       }
//       // Optionally delete the backup file after sending
//       fs.unlinkSync(backupFilePath);
//     });

//   } catch (error) {
//     console.error('Error creating backup:', error);
//     res.status(500).json({ error: 'Failed to create backup.' });
//   }
// };









// // Restore Function
// exports.restoreBackup = async (req, res) => {
//     try {
//       const { data } = req.body; // Backup data
  
//       // Check if the data is valid
//       if (!data || typeof data !== 'object') {
//         return res.status(400).json({ error: 'Invalid backup data.' });
//       }
  
//       // Loop through each collection and restore the data
//       for (const collectionName in data) {
//         const collectionData = data[collectionName];
//         const collection = mongoose.connection.db.collection(collectionName);
  
//         // Drop the collection to clear it before restoring
//         await collection.drop();
  
//         // Only insert data if the collection data is not empty
//         if (collectionData && Array.isArray(collectionData) && collectionData.length > 0) {
//           await collection.insertMany(collectionData);
//         } else {
//           console.log(`No data to restore for collection: ${collectionName}`);
//         }
//       }
  
//       res.status(200).json({ message: 'Data restored successfully!' });
//     } catch (error) {
//       console.error('Error restoring backup:', error);
//       res.status(500).json({ error: 'Failed to restore backup.' });
//     }
//   };












const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Backup Function
exports.createBackup = async (req, res) => {
  try {
    // Get all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    // Fetch data from all collections
    for (const collection of collections) {
      const data = await mongoose.connection.db
        .collection(collection.name)
        .find({})
        .toArray();
      backupData[collection.name] = data;
    }

    // Ensure the backups directory exists
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    // Generate the backup file path
    const backupFilePath = path.join(backupsDir, `backup-${Date.now()}.json`);

    // Write backup data to a file
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    // Send the backup file as a downloadable response
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(backupFilePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send({ error: 'Failed to send backup file.' });
      }
      // Optionally delete the backup file after sending
      fs.unlinkSync(backupFilePath);
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup.' });
  }
};

// Schedule Backup Function
exports.handleScheduleBackup = (frequency, time) => {
  // Validate frequency and time format
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    console.error('Invalid frequency.');
    return;
  }

  let cronExpression;
  switch (frequency) {
    case 'daily':
      cronExpression = `${time.split(':')[1]} ${time.split(':')[0]} * * *`; // Daily at the specified time
      break;
    case 'weekly':
      cronExpression = `${time.split(':')[1]} ${time.split(':')[0]} * * 0`; // Weekly on Sunday at the specified time
      break;
    case 'monthly':
      cronExpression = `${time.split(':')[1]} ${time.split(':')[0]} 1 * *`; // Monthly on the 1st day at the specified time
      break;
  }

  // Schedule the cron job for automated backup
  cron.schedule(cronExpression, async () => {
    try {
      // Trigger the backup process at the scheduled time
      console.log('Automated backup triggered');
      await exports.createBackup(); // Call the createBackup function
    } catch (error) {
      console.error('Error during scheduled backup:', error);
    }
  });
};

// Route to schedule automated backup
exports.scheduleBackup = (req, res) => {
  const { frequency, time } = req.body; // Get frequency and time from the request body

  try {
    exports.handleScheduleBackup(frequency, time);
    res.status(200).json({ message: 'Automated backup scheduled successfully.' });
  } catch (error) {
    console.error('Error scheduling backup:', error);
    res.status(500).json({ message: 'Error scheduling backup.' });
  }
};

// Restore Function
exports.restoreBackup = async (req, res) => {
  try {
    const { data } = req.body; // Backup data

    // Check if the data is valid
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid backup data.' });
    }

    // Loop through each collection and restore the data
    for (const collectionName in data) {
      const collectionData = data[collectionName];
      const collection = mongoose.connection.db.collection(collectionName);

      // Drop the collection to clear it before restoring
      await collection.drop();

      // Only insert data if the collection data is not empty
      if (collectionData && Array.isArray(collectionData) && collectionData.length > 0) {
        await collection.insertMany(collectionData);
      } else {
        console.log(`No data to restore for collection: ${collectionName}`);
      }
    }

    res.status(200).json({ message: 'Data restored successfully!' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup.' });
  }
};
