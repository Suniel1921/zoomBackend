// const applicationModel = require('../models/newModel/applicationModel');
// const { ObjectId } = require('mongoose').Types;

// // Create a new application
// exports.createApplication = async (req, res) => {
//   try {
//     const { clientId, clientName, familyMembers, payment, ...rest } = req.body;

//     const total = (payment.visaApplicationFee + payment.translationFee) -
//                   (payment.paidAmount + payment.discount);

//     const applicationData = {
//       ...rest,
//       clientName,
//       clientId: ObjectId(clientId),
//       familyMembers,
//       payment: {
//         ...payment,
//         total,
//       },
//       paymentStatus: total <= 0 ? 'Paid' : 'Due',
//     };

//     const newApplication = new applicationModel(applicationData);
//     await newApplication.save();

//     res.status(201).json({ message: 'Application created successfully', data: newApplication });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };

// // Get all applications
// exports.getApplications = async (req, res) => {
//   try {
//     const applications = await applicationModel.find().populate('clientId');
//     res.status(200).json({ data: applications });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };

// // Get a single application by ID
// exports.getApplicationById = async (req, res) => {
//   try {
//     const application = await applicationModel.findById(req.params.id).populate('clientId');
//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }
//     res.status(200).json({ data: application });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };

// // Update an application by ID
// exports.updateApplication = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const total = (updateData.payment.visaApplicationFee + updateData.payment.translationFee) -
//                   (updateData.payment.paidAmount + updateData.payment.discount);

//     // Set total and payment status
//     updateData.payment.total = total;
//     updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

//     const application = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });

//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }

//     res.status(200).json({ message: 'Application updated successfully', data: application });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };

// // Delete an application by ID
// exports.deleteApplication = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const application = await applicationModel.findByIdAndDelete(id);
//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }

//     res.status(200).json({ message: 'Application deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong', error: error.message });
//   }
// };











const applicationModel = require('../models/newModel/applicationModel');


// Create a new application
exports.createApplication = async (req, res) => {
  try {
    const { clientId, step, clientName, familyMembers, payment, ...rest } = req.body;

    // Calculate total payment
    const total = (payment.visaApplicationFee + payment.translationFee) - (payment.paidAmount + payment.discount);

    // Prepare application data
    const applicationData = {
      ...rest,
      clientName,
      clientId,  // Mongoose will automatically handle clientId as ObjectId
      step,
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

    res.status(201).json({success: true, message: 'Application created successfully', data: newApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
  }
};





// Get all applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await applicationModel.find().populate('clientId').populate('step');
    res.status(200).json({ data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Get a single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await applicationModel.findById(req.params.id).populate('clientId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json({ data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Update an application by ID
exports.updateApplication = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      // Log request body for debugging
      console.log('Request body:', updateData);
  
      // Check if the payment data is provided
      if (!updateData.payment) {
        return res.status(400).json({success: false, message: 'Payment data is required' });
      }
  
      // Set default values for missing payment fields
      const visaApplicationFee = updateData.payment.visaApplicationFee || 0;
      const translationFee = updateData.payment.translationFee || 0;
      const paidAmount = updateData.payment.paidAmount || 0;
      const discount = updateData.payment.discount || 0;
  
      // Calculate total payment
      const total = (visaApplicationFee + translationFee) - (paidAmount + discount);
  
      // Set total and payment status
      updateData.payment.total = total;
      updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';
  
      // Find and update the application
      const application = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!application) {
        return res.status(404).json({success: false, message: 'Application not found' });
      }
  
      res.status(200).json({success: true, message: 'Application updated successfully', data: application });
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
    }
  };
  


// Delete an application by ID
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the application
    const application = await applicationModel.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({success: false, message: 'Application not found' });
    }

    res.status(200).json({success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Something went wrong', error: error.message });
  }
};










