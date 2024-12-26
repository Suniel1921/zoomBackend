const applicationModel = require('../models/newModel/applicationModel');



// Create a new application
exports.createApplication = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Getting user ID from the authenticated user

    const { clientId, clientName, familyMembers, payment, steps, ...rest } = req.body;

    if (!superAdminId) {
      return res.status(400).json({ success: false, message: 'User is not authenticated' });
    }

    // Calculate total payment
    const total = (payment.visaApplicationFee + payment.translationFee) - (payment.paidAmount + payment.discount);

    // Use custom steps if provided, otherwise leave it undefined
    const applicationSteps = steps && Array.isArray(steps) ? steps : [];

    // Prepare application data
    const applicationData = {
      ...rest,
      superAdminId, 
      clientName,
      clientId,
      steps: applicationSteps, 
      familyMembers,
      payment: {
        ...payment,
        total,
      },
      paymentStatus: total <= 0 ? 'Paid' : 'Due',
    };

    // Save the new application
    const newApplication = new applicationModel(applicationData);
    await newApplication.save();

    res.status(201).json({ success: true, message: 'Application created successfully', data: newApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};




// Get all applications for the authenticated super admin
exports.getApplications = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 

    // console.log('Authenticated superAdminId:', superAdminId); 

    // Query to find applications where superAdminId matches
    const applications = await applicationModel
      .find({ superAdminId }) 
      .populate('clientId') 
      // .populate('step');

    // Check if any applications are found
    if (!applications || applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No applications found for this super admin' });
    }

    // Respond with the applications
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};



// Get a single application by ID for the authenticated super admin
exports.getApplicationById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const { id } = req.params;

    // Find the application and check if it belongs to the superAdminId
    const application = await applicationModel.findOne({ _id: id, superAdminId })
      .populate('clientId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found or you do not have access to it' });
    }
    
    res.status(200).json({ data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};



// // Update an application by ID controller
// exports.updateApplication = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     const { _id: superAdminId } = req.user; 

//     // Find the application to ensure it belongs to the authenticated user
//     const application = await applicationModel.findById(id);
//     if (!application) {
//       return res.status(404).json({ success: false, message: 'Application not found' });
//     }

//     // Check if the application belongs to the authenticated superAdminId
//     if (application.superAdminId.toString() !== superAdminId.toString()) {
//       return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to update this application' });
//     }

//     // Log request body for debugging
//     // console.log('Request body:', updateData);

//     // Validate payment data
//     if (!updateData.payment) {
//       return res.status(400).json({ success: false, message: 'Payment data is required' });
//     }

//     // Set default values for missing payment fields
//     const visaApplicationFee = updateData.payment.visaApplicationFee || 0;
//     const translationFee = updateData.payment.translationFee || 0;
//     const paidAmount = updateData.payment.paidAmount || 0;
//     const discount = updateData.payment.discount || 0;

//     // Calculate total payment
//     const total = (visaApplicationFee + translationFee) - (paidAmount + discount);

//     // Set total and payment status
//     updateData.payment.total = total;
//     updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

//     // Update the application
//     const updatedApplication = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });

//     res.status(200).json({ success: true, message: 'Application updated successfully', data: updatedApplication });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
//   }
// };





exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { _id: superAdminId } = req.user;

    // Find the application to ensure it belongs to the authenticated user
    const application = await applicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if the application belongs to the authenticated superAdminId
    if (application.superAdminId.toString() !== superAdminId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to update this application' });
    }

    // Validate payment data
    if (!updateData.payment) {
      return res.status(400).json({ success: false, message: 'Payment data is required' });
    }

    // Set default values for missing payment fields
    const visaApplicationFee = updateData.payment.visaApplicationFee || 0;
    const translationFee = updateData.payment.translationFee || 0;
    const paidAmount = updateData.payment.paidAmount || 0;
    const discount = updateData.payment.discount || 0;

    // Calculate total payment
    const total = (visaApplicationFee + translationFee) - (paidAmount + discount);
    updateData.payment.total = total;
    updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

    // Update the application, including family members if provided
    if (updateData.familyMembers) {
      application.familyMembers = updateData.familyMembers; // Update family members
    }

    const updatedApplication = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ success: true, message: 'Application updated successfully', data: updatedApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};






// Delete an application by ID
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: superAdminId } = req.user; 
    
    // Find the application to ensure it belongs to the authenticated user
    const application = await applicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if the application belongs to the authenticated superAdminId
    if (application.superAdminId.toString() !== superAdminId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to delete this application' });
    }

    // Delete the application
    await applicationModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};











