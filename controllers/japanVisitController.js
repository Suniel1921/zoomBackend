const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");

//create japanVisitApplication Controller
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


// get All Japan Visit Applications Controller
// exports.getAllJapanVisitApplications = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;

//     // Fetch applications where superAdminId matches the logged-in user's superAdminId
//     const applications = await japanVisitApplicationModel.find({ superAdminId }).populate('clientId');
//     res.status(200).json({ success: true, message: 'Data fetched successfully', data: applications });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
//   }
// };



exports.getAllJapanVisitApplications = async (req, res) => {
  const { _id, role, superAdminId } = req.user; // Extract user ID and role from authenticated user

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (!role || (role !== 'superadmin' && role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
  }

  try {
    let query = {};

    if (role === 'superadmin') {
      // SuperAdmin: Fetch all clients under their `superAdminId`
      query = { superAdminId: _id };
    } else if (role === 'admin') {
      // Admin: Fetch clients created by the admin or under their `superAdminId`
      query = { $or: [{ createdBy: _id }, { superAdminId }] };
    }

    // Query to get applications based on role and superAdminId
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

    // If no applications are found, return a 404 error
    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No japan visit application found' });
    }

    // Return the list of applications found
    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching japan visit applications:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};





//get Japan Visit Application By Id controller

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

//update Japan Visit Application Controller


// exports.updateJapanVisitApplication = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;
//     const { id } = req.params;
//     const updateData = req.body;

//     // Ensure the payment object exists in updateData
//     if (!updateData.payment) {
//       updateData.payment = {}; // Create an empty payment object if it's missing
//     }

//     // Calculate total payment
//     const {
//       visaApplicationFee = 0,
//       translationFee = 0,
//       paidAmount = 0,
//       discount = 0,
//     } = updateData.payment;

//     const total = (visaApplicationFee + translationFee) - (paidAmount + discount);

//     // Set total and payment status
//     updateData.payment.total = total;
//     updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

//     // Find and update the application
//     const application = await japanVisitApplicationModel.findOneAndUpdate(
//       { _id: id, superAdminId },
//       updateData,
//       { new: true }
//     );

//     if (!application) {
//       return res.status(404).json({ message: 'Application not found or you are not authorized to update it' });
//     }

//     res.status(200).json({ success: true, message: 'Application updated successfully', data: application });
//   } catch (error) {
//     console.error('Error updating application:', error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };


exports.updateJapanVisitApplication = async (req, res) => {
  const { _id: userId, role, superAdminId } = req.user; // Get user info from token
  const { id } = req.params;
  const updateData = req.body;

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (role !== 'superadmin' && role !== 'admin') {
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
  }

  // Ensure the payment object exists in updateData
  if (!updateData.payment) {
    updateData.payment = {};
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

  try {
    let query = {};

    if (role === "superadmin") {
      // SuperAdmin: Can update any application under their `superAdminId`
      query = { _id: id, superAdminId: userId };
    } else if (role === "admin") {
      // Admin: Can update applications created by them or under their `superAdminId`
      query = { _id: id, $or: [{ createdBy: userId }, { superAdminId }] };
    }

    // Find and update the Japan visit application based on the query
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





