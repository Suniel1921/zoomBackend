// const AuditLog = require('../models/newModel/auditLogModel');

// // Fetch all audit logs
// exports.getLogs = async (req, res) => {
//     try {
//       const { page = 1, limit = 10 } = req.query;
//       const logs = await AuditLog.find()
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit));
//       res.status(200).json({ success: true, message: 'Logs fetched successfully', logs });
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch logs', error });
//     }
//   };
  
  

// // Export logs to CSV or PDF (for simplicity, CSV only here)
// exports.exportLogs = async (req, res) => {
//   const { format } = req.query;

//   try {
//     const logs = await AuditLog.find();

//     if (format === 'csv') {
//       // Prepare CSV content
//       const csvContent = [
//         ['Timestamp', 'User', 'Action', 'Details', 'IP Address'].join(','),
//         ...logs.map(log =>
//           [
//             log.timestamp,
//             log.userName,
//             log.action,
//             JSON.stringify(log.details).replace(/"/g, '""'), 
//             log.ipAddress,
//           ]
//           .map(value => `"${value}"`) 
//           .join(',')
//         ),
//       ].join('\n');

//       // Send the CSV response
//       res.header('Content-Type', 'text/csv');
//       res.attachment(`audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
//       res.send(csvContent);
//     } else {
//       res.status(400).json({ message: 'Invalid format' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error exporting logs', error });
//   }
// };


// // Clear all logs
// exports.clearAllLogs = async (req, res) => {
//   try {
//     await AuditLog.deleteMany({});
//     res.status(200).json({ message: 'All logs cleared' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to clear logs', error });
//   }
// };

// // Clear logs older than a certain retention period
// exports.clearOldLogs = async (req, res) => {
//   const { retentionDays } = req.query;
//   const cutoffDate = new Date();
//   cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

//   try {
//     await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate.toISOString() } });
//     res.status(200).json({ message: `Logs older than ${retentionDays} days cleared` });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to clear old logs', error });
//   }
// };









// controllers/auditLogController.js
const AuditLog = require('../models/newModel/auditLogModel');

// Add a new log
exports.addLog = async (action, userType, userId, userName, ipAddress, details = {}) => {
  try {
    const log = new AuditLog({
      action,
      userType,
      userId,
      userName,
      ipAddress,
      details,
    });
    await log.save();
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
};

// Fetch all audit logs
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const logs = await AuditLog.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.status(200).json({ success: true, message: 'Logs fetched successfully', logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error });
  }
};

// Export logs to CSV
exports.exportLogs = async (req, res) => {
  const { format } = req.query;

  try {
    const logs = await AuditLog.find();

    if (format === 'csv') {
      // Prepare CSV content
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Details', 'IP Address'].join(','),
        ...logs.map(log =>
          [
            log.timestamp,
            log.userName,
            log.action,
            JSON.stringify(log.details).replace(/"/g, '""'), 
            log.ipAddress,
          ]
          .map(value => `"${value}"`) 
          .join(',')
        ),
      ].join('\n');

      // Send the CSV response
      res.header('Content-Type', 'text/csv');
      res.attachment(`audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      res.status(400).json({ message: 'Invalid format' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting logs', error });
  }
};

// Clear all logs
exports.clearAllLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.status(200).json({ message: 'All logs cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear logs', error });
  }
};

// Clear logs older than a certain retention period
exports.clearOldLogs = async (req, res) => {
  const { retentionDays } = req.query;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate.toISOString() } });
    res.status(200).json({ message: `Logs older than ${retentionDays} days cleared` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear old logs', error });
  }
};