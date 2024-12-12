const japanVisitAppplicaitonModel = require('../models/newModel/japanVisitModel');
const japanVisitModel = require('../models/newModel/japanVisitModel');



exports.createJapanVisitApplication = async (req, res) => {
  try {
    const {
      clientId, step, mobileNo, date, deadline, handledBy, package: packageType,
      noOfApplicants, reasonForVisit, otherReason, amount, paidAmount, 
      discount, deliveryCharge, dueAmount, paymentStatus, paymentMethod, 
      modeOfDelivery, notes
    } = req.body;

    // Validate required fields
    if (!clientId || !packageType || !reasonForVisit || !modeOfDelivery) {
      return res.status(400).json({success: false, message: 'Missing required fields' });
    }

    // Create application instance
    const application = new japanVisitAppplicaitonModel({
      clientId, step, mobileNo, date, deadline, handledBy, package: packageType,
      noOfApplicants, reasonForVisit, otherReason, amount, paidAmount, 
      discount, deliveryCharge, dueAmount, paymentStatus, paymentMethod, 
      modeOfDelivery, notes
    });

    // Save to database
    const savedApplication = await application.save();

    // Return success response
    res.status(201).json({success: true, message: 'Japan visit application created successfully', data: savedApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({success: false, message: 'Internal Server Error', error: error.message });
  }
};



// Get all applications
exports.getAllJapanVisitApplications = async (req, res) => {
  try {
    const applications = await japanVisitAppplicaitonModel.find().populate('clientId').populate('step');
    res.status(200).json({success: true, message: 'data fected', data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
  }
};



// Get application by ID

exports.getJapanVisitApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await japanVisitAppplicaitonModel.findById(id);
    if (!application) {
      return res.status(404).json({success: false, message: 'Application not found' });
    }
    res.status(200).json({success: true, message: "japanVisit data fetched", data: application });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
  }
};



exports.updateJapanVisitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure the payment object exists in updateData
    if (!updateData.payment) {
      updateData.payment = {}; // Create an empty payment object if it's missing
    }

    // Calculate total payment
    const {
      visaApplicationFee = 0,
      translationFee = 0,
      paidAmount = 0,
      discount = 0,
    } = updateData.payment;

    const total = (visaApplicationFee + translationFee) - (paidAmount + discount);

    // Set total and payment status
    updateData.payment.total = total;
    updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

    // Find and update the application
    const application = await japanVisitAppplicaitonModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({success: true, message: 'Application updated successfully', data: application });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};


// Delete an application by ID
exports.deleteJapanVisitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await japanVisitAppplicaitonModel.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({success: false, message: 'Application not found' });
    }
    res.status(200).json({success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
  }
};
