const AuditLog = require('../models/newModel/auditLogModel');

// Add a new log
exports.addLog = async (action, userType, userId, userName, ipAddress, details = {}) => {
  try {
    if (!action || !userName || !ipAddress) {
      console.error('Missing required audit log fields:', { action, userName, ipAddress });
      return;
    }

    // Clean the IP address
    const cleanIpAddress = ipAddress.replace(/^::ffff:/, '');

    const log = new AuditLog({
      action,
      userType: userType || 'unknown',
      userId,
      userName,
      ipAddress: cleanIpAddress,
      details: typeof details === 'object' ? details : { message: details }
    });

    await log.save();
    // console.log('Audit log created:', {
    //   action,
    //   userType,
    //   userName,
    //   ipAddress: cleanIpAddress
    // });
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
};

// Fetch all audit logs with pagination and filtering
exports.getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      userType,
      action,
      startDate,
      endDate,
      searchQuery 
    } = req.query;

    const query = {};

    if (userType) query.userType = userType;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endDateTime;
      }
    }
    if (searchQuery) {
      query.$or = [
        { userName: { $regex: searchQuery, $options: 'i' } },
        { 'details.message': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Logs fetched successfully',
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
  }
};

// Export logs to CSV
exports.exportLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });

    const csvContent = [
      ['Timestamp', 'User Name', 'User Type', 'Action', 'IP Address', 'Details'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userName,
        log.userType,
        log.action,
        log.ipAddress,
        JSON.stringify(log.details || {}).replace(/"/g, '""')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ success: false, message: 'Error exporting logs', error: error.message });
  }
};

// Clear all logs
exports.clearAllLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.status(200).json({ success: true, message: 'All logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ success: false, message: 'Failed to clear logs', error: error.message });
  }
};