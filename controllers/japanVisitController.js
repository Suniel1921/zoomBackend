const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");

// Create Japan Visit Application Controller
exports.createJapanVisitApplication = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, role } = req.user;

    const {
      clientId, steps, mobileNo, date, deadline, handledBy, status, package: packageType,
      noOfApplicants, reasonForVisit, otherReason, amount, paidAmount,
      discount, deliveryCharge, dueAmount, paymentStatus, paymentMethod,
      modeOfDelivery, notes
    } = req.body;

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== 'superadmin' && (!superAdminId || role !== 'admin')) {
      console.log('Unauthorized access attempt:', req.user);
      return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
    }

    // If the user is a superadmin, use their userId as superAdminId
    const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

    // Validate required fields
    if (!clientId || !packageType || !reasonForVisit || !modeOfDelivery) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Use custom steps if provided, otherwise leave it undefined
    const applicationSteps = steps && Array.isArray(steps) ? steps : [];

    // Create application instance
    const application = new japanVisitApplicationModel({
      superAdminId: clientSuperAdminId,
      createdBy,
      clientId, mobileNo, date, deadline, handledBy, status, package: packageType,
      noOfApplicants, reasonForVisit, otherReason, amount, paidAmount,
      discount, deliveryCharge, dueAmount, paymentStatus, paymentMethod,
      modeOfDelivery, notes, steps: applicationSteps,
    });

    // Save to database
    const savedApplication = await application.save();

    // Return success response
    res.status(201).json({ success: true, message: 'Japan visit application created successfully', data: savedApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Get All Japan Visit Applications Controller
exports.getAllJapanVisitApplications = async (req, res) => {
  const { _id, role, superAdminId } = req.user;

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (!role || (role !== 'superadmin' && role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
  }

  try {
    let query = {};

    if (role === 'superadmin') {
      query = { superAdminId: _id };
    } else if (role === 'admin') {
      query = { $or: [{ createdBy: _id }, { superAdminId }] };
    }

    const applications = await japanVisitApplicationModel
      .find(query)
      .populate({
        path: 'createdBy',
        select: 'name email',
      })
      .populate({
        path: 'clientId',
        select: 'name email phone'
      })
      .exec();

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No japan visit application found' });
    }

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching japan visit applications:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

// Get Japan Visit Application By Id Controller
exports.getJapanVisitApplicationById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const { id } = req.params;

    const application = await japanVisitApplicationModel.findOne({ _id: id, superAdminId });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or you are not authorized to view it' });
    }

    res.status(200).json({ success: true, message: "Japan Visit application data fetched", data: application });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

// Update Japan Visit Application Controller
exports.updateJapanVisitApplication = async (req, res) => {
  const { _id: userId, role, superAdminId } = req.user;
  const { id } = req.params;
  const updateData = req.body;

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (role !== 'superadmin' && role !== 'admin') {
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
  }

  try {
    let query = {};

    if (role === "superadmin") {
      query = { _id: id, superAdminId: userId };
    } else if (role === "admin") {
      query = { _id: id, $or: [{ createdBy: userId }, { superAdminId }] };
    }

    // Calculate dueAmount and paymentStatus
    const { amount = 0, paidAmount = 0, discount = 0, deliveryCharge = 0 } = updateData;
    const dueAmount = (amount + deliveryCharge) - (paidAmount + discount);
    updateData.dueAmount = dueAmount;
    updateData.paymentStatus = dueAmount <= 0 ? 'Paid' : 'Due';

    const application = await japanVisitApplicationModel.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or you are not authorized to update it' });
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

// Delete Japan Visit Application Controller
exports.deleteJapanVisitApplication = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const { id } = req.params;

    const application = await japanVisitApplicationModel.findOneAndDelete({ _id: id, superAdminId });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or you are not authorized to delete it' });
    }

    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};




//delete Japan Visit Application Controller
exports.deleteJapanVisitApplication = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 
    const { id } = req.params;

    const application = await japanVisitApplicationModel.findOneAndDelete({ _id: id, superAdminId });
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or you are not authorized to delete it' });
    }

    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};





