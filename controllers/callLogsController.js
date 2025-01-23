const CallLogsModel = require('../models/newModel/callLogsModel');

// Create new call log
exports.createCallLogs = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, role } = req.user;
    const { name, phone, purpose, handler, followUp, remarks } = req.body;

    

    // Validate required fields
    if (!name || !phone || !purpose || !handler) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check authorization
    if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: Access denied!" 
      });
    }

    const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;
    
    const callLogs = new CallLogsModel({
      name,
      phone,
      purpose,
      handler,
      followUp,
      remarks: remarks || 'Working on it',
      superAdminId: clientSuperAdminId,
      createdBy,
    });

    await callLogs.save();

    // Emit socket event for real-time updates
    req.io?.emit('newCallLog', {
      message: 'New call log created',
      callLog: callLogs
    });

    res.status(201).json({
      success: true,
      message: "Call log added successfully",
      callLogs,
    });
  } catch (error) {
    console.error('Create call log error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get all call logs
exports.getAllCallLogs = async (req, res) => {
  try {
    const { superAdminId, _id: userId, role } = req.user;
    const query = role === "superadmin" ? 
      { superAdminId: userId } : 
      { superAdminId };

    const callLogs = await CallLogsModel.find(query)
      .sort('-createdAt')
      .populate('createdBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      count: callLogs.length,
      callLogs,
    });
  } catch (error) {
    console.error('Get call logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Update call log
exports.updateCallLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { superAdminId, role } = req.user;
    const updates = req.body;

    const callLog = await CallLogsModel.findById(id);

    if (!callLog) {
      return res.status(404).json({ 
        success: false, 
        message: "Call log not found" 
      });
    }

    // Check authorization
    if (callLog.superAdminId.toString() !== superAdminId && role !== "superadmin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update this call log" 
      });
    }

    const updatedCallLog = await CallLogsModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    // Emit socket event for real-time updates
    req.io?.emit('updateCallLog', {
      message: 'Call log updated',
      callLog: updatedCallLog
    });

    res.status(200).json({
      success: true,
      message: "Call log updated successfully",
      callLog: updatedCallLog,
    });
  } catch (error) {
    console.error('Update call log error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Delete call log
exports.deleteCallLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { superAdminId, role } = req.user;

    const callLog = await CallLogsModel.findById(id);

    if (!callLog) {
      return res.status(404).json({ 
        success: false, 
        message: "Call log not found" 
      });
    }

    // Check authorization
    if (callLog.superAdminId.toString() !== superAdminId && role !== "superadmin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this call log" 
      });
    }

    await CallLogsModel.findByIdAndDelete(id);

    // Emit socket event for real-time updates
    req.io?.emit('deleteCallLog', {
      message: 'Call log deleted',
      callLogId: id
    });

    res.status(200).json({
      success: true,
      message: "Call log deleted successfully",
    });
  } catch (error) {
    console.error('Delete call log error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};