// const GraphicDesignModel = require("../models/newModel/graphicDesingModel");


// //create graphicDesing Controller
// exports.createGraphicDesign = async (req, res) => {
//   try {
//     const { superAdminId, _id: createdBy, role } = req.user;
//     const {
//       clientId, handledBy, businessName, mobileNo, landlineNo, address, designType,
//       amount, advancePaid, remarks, status, deadline
//     } = req.body;

//     // Role-based check: Only 'superadmin' or 'admin' are allowed
//     if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
//       console.log("Unauthorized access attempt:", req.user); 
//       return res
//         .status(403)
//         .json({ success: false, message: "Unauthorized: Access denied." });
//     }
  
//     // If the user is a superadmin, use their userId as superAdminId
//     const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

//     const dueAmount = amount - advancePaid;
//     const paymentStatus = dueAmount > 0 ? 'Due' : 'Paid';


//     const designJob = new GraphicDesignModel({
//       superAdminId: clientSuperAdminId,
//       createdBy, 
//       clientId,
//       handledBy,
//       businessName,
//       mobileNo,
//       landlineNo,
//       address,
//       designType,
//       amount,
//       advancePaid,
//       remarks,
//       status,
//       deadline,
//       dueAmount,
//       paymentStatus,
//     });

//     await designJob.save();

//     res.status(201).json({ success: true, message: 'Design job created successfully', designJob });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error creating design job', error });
//   }
// };





// *************websocket for seding real time notfication while creating a data**************



const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const notificationController = require("../controllers/notificationController");

// Create Graphic Design Controller
exports.createGraphicDesign = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, fullName: creatorName, role } = req.user;
    const {
      clientId,
      handledBy,
      businessName,
      mobileNo,
      landlineNo,
      address,
      designType,
      amount,
      advancePaid,
      remarks,
      status,
      deadline,
      clientName, // Add clientName for notification
      handlerId   // Add handlerId for notification
    } = req.body;

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
      console.log("Unauthorized access attempt:", req.user);
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: Access denied." });
    }

    // If the user is a superadmin, use their userId as superAdminId
    const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

    const dueAmount = amount - advancePaid;
    const paymentStatus = dueAmount > 0 ? 'Due' : 'Paid';

    const designJob = new GraphicDesignModel({
      superAdminId: clientSuperAdminId,
      createdBy,
      clientId,
      handledBy,
      businessName,
      mobileNo,
      landlineNo,
      address,
      designType,
      amount,
      advancePaid,
      remarks,
      status,
      deadline,
      dueAmount,
      paymentStatus,
      handlerId // Store handlerId if needed in DB
    });

    const savedDesignJob = await designJob.save();

    // Notification logic
    if (handlerId && handlerId !== createdBy.toString()) {
      console.log('Attempting to send notification:', { handlerId, createdBy, clientName });
      try {
        await notificationController.createNotification({
          recipientId: handlerId,
          senderId: createdBy,
          type: 'TASK_ASSIGNED',
          taskId: savedDesignJob._id,
          taskModel: 'GraphicDesignModel',
          message: `${creatorName || 'Someone'} has assigned you a graphic design task for ${clientName || 'a client'}`
        });
        console.log('Notification created successfully for graphic design job');
      } catch (notificationError) {
        console.error('Failed to create notification for graphic design job:', notificationError);
      }
    } else {
      console.log('No notification sent: handlerId missing or same as createdBy', { handlerId, createdBy });
    }

    res.status(201).json({ success: true, message: 'Design job created successfully', designJob: savedDesignJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating design job', error });
  }
};


exports.getAllGraphicDesign = async (req, res) => {
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
    const designJobs = await GraphicDesignModel
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
    if (designJobs.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No graphic desing data found",
        });
    }

    // Return the list of applications found
    return res.status(200).json({
      success: true,
      designJobs,
    });
  } catch (error) {
    console.error(
      "Error fetching graphic desing data",
      error.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};






// Get a Design Job by ID for the authenticated superAdmin
exports.getGraphicDesignById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const { id } = req.params;
    const designJob = await GraphicDesignModel.findOne({ _id: id, superAdminId })
      .populate('clientId', 'name');

    if (!designJob) {
      return res.status(404).json({ success: false, message: 'Design job not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Data fetched successfully', designJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching design job', error });
  }
};

exports.updateGraphicDesign = async (req, res) => {
  try {
    const { amount, advancePaid, paymentStatus } = req.body;
    const { _id: adminId, role, superAdminId } = req.user;
    const { id } = req.params;

    // Validate request body
    if (typeof amount !== "number" || typeof advancePaid !== "number") {
      return res.status(400).json({
        success: false,
        message: "Invalid data: 'amount' and 'advancePaid' must be numbers",
      });
    }

    // Role-based access control
    if (role !== "superadmin" && role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: Access denied." });
    }

    // Find the graphic design job
    const graphicDesign = await GraphicDesignModel.findById(id);

    if (!graphicDesign) {
      return res
        .status(404)
        .json({ success: false, message: "Graphic design job not found" });
    }

    // Role-based ownership checks
    if (role === "superadmin") {
      if (
        !graphicDesign.superAdminId ||
        graphicDesign.superAdminId.toString() !== adminId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Unauthorized to update this job",
        });
      }
    } else if (role === "admin") {
      if (
        !graphicDesign.superAdminId ||
        graphicDesign.superAdminId.toString() !== superAdminId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Unauthorized to update this job",
        });
      }
    }

    // Calculate the dueAmount
    const dueAmount = amount - advancePaid;

    // Ensure paymentStatus is consistent with dueAmount (just in case frontend sends inconsistent data)
    const updatedPaymentStatus = dueAmount === 0 ? "Paid" : "Due";

    // Update the graphic design job
    const updatedGraphicDesign = await GraphicDesignModel.findByIdAndUpdate(
      id,
      { ...req.body, dueAmount, paymentStatus: updatedPaymentStatus },
      { new: true }
    );

    if (!updatedGraphicDesign) {
      return res.status(404).json({
        success: false,
        message: "Graphic design job not found after update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Graphic design job updated successfully",
      data: updatedGraphicDesign,
    });
  } catch (error) {
    console.error("Error updating graphic design job:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the graphic design job",
      error: error.message,
    });
  }
};



// Delete a Design Job by ID for the authenticated superAdmin
exports.deleteGraphicDesign = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const { id } = req.params;

    const designJob = await GraphicDesignModel.findOneAndDelete({ _id: id, superAdminId });

    if (!designJob) {
      return res.status(404).json({ success: false, message: 'Design job not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Design job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting design job', error });
  }
};
