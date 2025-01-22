const applicationModel = require('../models/newModel/applicationModel');



// Create a new application
exports.createApplication = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, role } = req.user; // Extract user ID and role from authenticated user
    const {clientId, clientName, familyMembers, payment, steps, ...rest } = req.body;

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== 'superadmin' && (!superAdminId || role !== 'admin')) {
      console.log('Unauthorized access attempt:', req.user);  // Log for debugging
      return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
    }


    // If the user is a superadmin, use their userId as superAdminId
    const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

    if (!clientSuperAdminId) {
      return res.status(400).json({ success: false, message: 'SuperAdminId is required' });
    }

    // Calculate total payment
    const total = (payment.visaApplicationFee + payment.translationFee) - (payment.paidAmount + payment.discount);

    // Prepare application data
    const applicationData = {
      superAdminId: clientSuperAdminId,  // Use the determined superAdminId
      createdBy,  // The user creating the application
      clientName,
      clientId,
      familyMembers,
      payment: {
        ...payment,
        total,
      },
      paymentStatus: total <= 0 ? 'Paid' : 'Due',
      steps: Array.isArray(steps) ? steps : [],  // Ensure steps are provided if necessary
      ...rest,
    };

    // Save the new application to the database
    const newApplication = new applicationModel(applicationData);
    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: newApplication,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};





// Get all applications for the authenticated user (superadmin or admin)
exports.getApplications = async (req, res) => {
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

    // Query to get applications based on role and superAdminId
    const applications = await applicationModel
      .find(query)
      .populate('createdBy', 'name email') 
      .exec();

    // If no applications are found, return a 404 error
    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No applications found' });
    }

    // Return the list of applications found
    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
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
//     updateData.payment.total = total;
//     updateData.paymentStatus = total <= 0 ? 'Paid' : 'Due';

//     // Update the application, including family members if provided
//     if (updateData.familyMembers) {
//       application.familyMembers = updateData.familyMembers; // Update family members
//     }

//     const updatedApplication = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });

//     res.status(200).json({ success: true, message: 'Application updated successfully', data: updatedApplication });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
//   }
// };






// Delete an application by ID


exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { _id: adminId, role, superAdminId } = req.user;

    console.log("User Info:", { adminId, role, superAdminId });

    // Find the application to ensure it exists
    const application = await applicationModel.findById(id);

    // Verify if application exists
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    console.log("Application Found:", application);

    // Role-based access control
    if (role === "superadmin") {
      if (!application.superAdminId || application.superAdminId.toString() !== adminId.toString()) {
        console.log("SuperAdmin ID mismatch:", {
          applicationSuperAdminId: application.superAdminId,
          requestSuperAdminId: adminId, // Use adminId as the superadmin ID
        });
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to update this application",
        });
      }
    } else if (role === "admin") {
      // Check if admin has access
      const belongsToSuperAdmin = application.superAdminId.toString() === superAdminId?.toString();
      const createdByAdmin = application.createdBy ? application.createdBy.toString() === adminId.toString() : false;

      if (!belongsToSuperAdmin && !createdByAdmin) {
        console.log("Admin access denied:", {
          applicationSuperAdminId: application.superAdminId,
          applicationCreatedBy: application.createdBy,
          requestSuperAdminId: superAdminId,
        });
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to update this application",
        });
      }
    }

    // Validate payment data if provided
    if (updateData.payment) {
      const { visaApplicationFee, translationFee, paidAmount, discount } = updateData.payment;

      // Set default values for missing payment fields
      const visaAppFee = visaApplicationFee || 0;
      const translation = translationFee || 0;
      const paid = paidAmount || 0;
      const disc = discount || 0;

      // Calculate total payment
      const total = visaAppFee + translation - (paid + disc);
      updateData.payment.total = total;
      updateData.paymentStatus = total <= 0 ? "Paid" : "Due";
    }

    // Update family members if provided
    if (updateData.familyMembers) {
      application.familyMembers = updateData.familyMembers;
    }

    // Update the application
    const updatedApplication = await applicationModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error:", error.message); // Log the actual error message
    res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};




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









// ************upload multiple file***********

// const upload = require('../config/multerConfig');
// const cloudinary = require('cloudinary').v2;

// exports.allApplicationFileUpload = [
//   upload.array('clientFiles', 5), // Handling multiple file uploads (max 5 files)
//   async (req, res) => {
//     try {
//       const { clientId } = req.params; 
//       // console.log(clientId)
//       console.log('Params:', req.params);


//       if(!clientId){
//         return res.status(404).json({success : false, message: 'client id not found'})
//       }

//       // Check if files were uploaded
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No files uploaded' });
//       }

//       // Find the application (ePassport) for the specific clientId
//       const application = await applicationModel.findOne({ clientId });


//       if (!application) {
//         return res.status(404).json({ success: false, message: 'Application not found for this user' });
//       }

//       // Process each file and upload to Cloudinary
//       const clientFilesUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         clientFilesUrls.push(result.secure_url); // Collect all the uploaded file URLs
//       }

//       // Save the uploaded file URLs in the application model
//       application.clientFiles = application.clientFiles || []; // Initialize the files array if not already
//       application.clientFiles.push(...clientFilesUrls); // Add the new file URLs

//       // Save the updated application data
//       await application.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Files uploaded successfully',
//         fileUrls: clientFilesUrls, // Return the list of URLs to the client
//       });
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       return res.status(500).json({ success: false, message: 'Server error while uploading files' });
//     }
//   }
// ];














