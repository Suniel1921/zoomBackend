// const ClientModel = require("../models/newModel/clientModel");
// const OtherServiceModel = require("../models/newModel/otherServicesModel");


// // Create a new Service Controller
// exports.createOtherServices = async (req, res) => {
//   try {
//     const { superAdminId, _id: createdBy, role } = req.user;
//     const {
//       clientId,
//       serviceTypes,
//       otherServiceDetails,
//       contactChannel,
//       deadline,
//       amount,
//       paidAmount,
//       discount,
//       paymentMethod,
//       handledBy,
//       jobStatus,
//       remarks,
//       steps, 
//     } = req.body;

    
//   // Role-based check: Only 'superadmin' or 'admin' are allowed
//   if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
//     console.log("Unauthorized access attempt:", req.user); // Log for debugging
//     return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
//   }

//   // If the user is a superadmin, use their userId as superAdminId
//   const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;


//     // Validate and initialize steps if provided
//     const applicationSteps = steps && Array.isArray(steps) ? steps : [];

//     // Calculate the due amount
//     const dueAmount = amount - (paidAmount + discount);

//     // Create a new service record
//     const newService = new OtherServiceModel({
//       superAdminId: clientSuperAdminId,
//       createdBy, 
//       clientId,
//       serviceTypes,
//       otherServiceDetails,
//       contactChannel,
//       deadline,
//       amount,
//       paidAmount,
//       discount,
//       paymentMethod,
//       handledBy,
//       jobStatus,
//       remarks,
//       dueAmount,
//       paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
//       steps: applicationSteps, 
//     });

//     // Save the service to the database
//     await newService.save();

//     return res.status(201).json({
//       success: true,
//       message: 'Service created successfully',
//       data: newService,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Internal server error', error });
//   }
// };




// Get all services for the authenticated superAdmin






// ******************websocket sending real time notfication****************
const OtherServiceModel = require("../models/newModel/otherServicesModel");
const notificationController = require("../controllers/notificationController");

// Create a new Service Controller
exports.createOtherServices = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, fullName: creatorName, role } = req.user;
    const {
      clientId,
      serviceTypes,
      otherServiceDetails,
      contactChannel,
      deadline,
      amount,
      paidAmount,
      discount,
      paymentMethod,
      handledBy,
      jobStatus,
      remarks,
      steps,
      clientName, // Add clientName for notification
      handlerId   // Add handlerId for notification
    } = req.body;

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
      console.log("Unauthorized access attempt:", req.user);
      return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
    }

    // If the user is a superadmin, use their userId as superAdminId
    const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

    // Validate and initialize steps if provided
    const applicationSteps = steps && Array.isArray(steps) ? steps : [];

    // Calculate the due amount
    const dueAmount = amount - (paidAmount + discount);

    // Create a new service record
    const newService = new OtherServiceModel({
      superAdminId: clientSuperAdminId,
      createdBy,
      clientId,
      serviceTypes,
      otherServiceDetails,
      contactChannel,
      deadline,
      amount,
      paidAmount,
      discount,
      paymentMethod,
      handledBy,
      jobStatus,
      remarks,
      dueAmount,
      paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
      steps: applicationSteps,
      handlerId // Store handlerId if needed in DB
    });

    // Save the service to the database
    const savedService = await newService.save();

    // Notification logic
    if (handlerId && handlerId !== createdBy.toString()) {
      console.log('Attempting to send notification:', { handlerId, createdBy, clientName });
      try {
        await notificationController.createNotification({
          recipientId: handlerId,
          senderId: createdBy,
          type: 'TASK_ASSIGNED',
          taskId: savedService._id,
          taskModel: 'OtherServiceModel',
          message: `${creatorName || 'Someone'} has assigned you an other service task for ${clientName || 'a client'}`
        });
        console.log('Notification created successfully for other service');
      } catch (notificationError) {
        console.error('Failed to create notification for other service:', notificationError);
      }
    } else {
      console.log('No notification sent: handlerId missing or same as createdBy', { handlerId, createdBy });
    }

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: savedService,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};




exports.getAllOtherServices = async (req, res) => {
  const { _id, role, superAdminId } = req.user; 

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (!role || (role !== "superadmin" && role !== "admin")) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Access denied." });
  }

  try {
    let query = {};

    if (role === "superadmin") {
      // SuperAdmin: Fetch all clients under their `superAdminId`
      query = { superAdminId: _id };
    } else if (role === "admin") {
      // Admin: Fetch clients created by the admin or under their `superAdminId`
      query = { $or: [{ createdBy: _id }, { superAdminId }] };
    }

    // Query to get applications based on role and superAdminId
    const services = await OtherServiceModel
      .find(query) 
      .populate({
        path: "createdBy", 
        select: "name email", 
      })
      .populate({
        path: "clientId", 
        select: "name email phone", 
      }).sort({createdAt: -1})
      .exec();

    // If no applications are found, return a 404 error
    if (services.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No other services application found",
        });
    }

    // Return the list of applications found
    return res.status(200).json({
      success: true,
      data: services,
    });


  } catch (error) {
    console.error(
      "Error fetching other services applications:",
      error.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};







// Get service by ID for the authenticated superAdmin
exports.getOtherServicesByID = async (req, res) => {
  const { id } = req.params;
  try {
    const { _id: superAdminId } = req.user;
    const service = await OtherServiceModel.findOne({ _id: id, superAdminId }).populate('clientId', 'name phone');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service', error });
  }
};

// Update a service by ID for the authenticated superAdmin


//  ********this is code allow any admin can update the data check the below code controller if work then remove this code*******
// exports.updateOtherServices = async (req, res) => {
//   const { id } = req.params;
//   const {
//     serviceTypes,
//     otherServiceDetails,
//     contactChannel,
//     deadline,
//     amount,
//     paidAmount,
//     discount,
//     paymentMethod,
//     handledBy,
//     jobStatus,
//     remarks,
//   } = req.body;

//   try {
//     const { _id: superAdminId, role } = req.user;

//     // Role-based check: Only 'superadmin' or 'admin' are allowed
//     if (role !== 'superadmin' && role !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
//     }

//     // Find the service by ID and superAdminId to ensure the user has permission to update it
//     const service = await OtherServiceModel.findOne({ _id: id });
//     if (!service) {
//       return res.status(404).json({ success: false, message: 'Service not found' });
//     }

//     // If the user is an admin, they can update any service (not just their own)
//     if (role === 'admin') {
//       // Allow admin to update any service
//       // Optionally, you can add additional checks here if needed (e.g., check if the service belongs to the same superAdminId)
//     }

//     // If the user is a superadmin, they can update any service
//     if (role === 'superadmin') {
//       // Allow superadmin to update any service
//     }

//     // Update the service fields (clientId remains unchanged)
//     service.serviceTypes = serviceTypes;
//     service.otherServiceDetails = otherServiceDetails;
//     service.contactChannel = contactChannel;
//     service.deadline = deadline;
//     service.amount = amount;
//     service.paidAmount = paidAmount;
//     service.discount = discount;
//     service.paymentMethod = paymentMethod;
//     service.handledBy = handledBy;
//     service.jobStatus = jobStatus;
//     service.remarks = remarks;

//     // Recalculate the due amount
//     service.dueAmount = amount - (paidAmount + discount);
//     service.paymentStatus = service.dueAmount > 0 ? 'Due' : 'Paid';

//     // Save the updated service
//     await service.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Service updated successfully',
//       data: service,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Internal server error', error });
//   }
// };





exports.updateOtherServices = async (req, res) => {
  const { id } = req.params;
  const {
    serviceTypes,
    otherServiceDetails,
    contactChannel,
    deadline,
    amount,
    paidAmount,
    discount,
    paymentMethod,
    handledBy,
    jobStatus,
    remarks,
  } = req.body;

  try {
    const { _id: userId, superAdminId, role } = req.user;

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
    }

    // Find the service by ID
    const service = await OtherServiceModel.findOne({ _id: id });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if the service belongs to the same superAdminId
    if (role === 'admin' && service.superAdminId.toString() !== superAdminId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not have permission to update this service.' });
    }

    // Update the service fields (clientId remains unchanged)
    service.serviceTypes = serviceTypes;
    service.otherServiceDetails = otherServiceDetails;
    service.contactChannel = contactChannel;
    service.deadline = deadline;
    service.amount = amount;
    service.paidAmount = paidAmount;
    service.discount = discount;
    service.paymentMethod = paymentMethod;
    service.handledBy = handledBy;
    service.jobStatus = jobStatus;
    service.remarks = remarks;

    // Recalculate the due amount
    service.dueAmount = amount - (paidAmount + discount);
    service.paymentStatus = service.dueAmount > 0 ? 'Due' : 'Paid';

    // Save the updated service
    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};




// Delete a service by ID for the authenticated superAdmin
exports.deleteOtherServices = async (req, res) => {
  const { id } = req.params;
  try {
    const { _id: superAdminId } = req.user;
    
    // Find and delete the service using findOneAndDelete with superAdminId check
    const service = await OtherServiceModel.findOneAndDelete({ _id: id, superAdminId });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete service', error });
  }
};
