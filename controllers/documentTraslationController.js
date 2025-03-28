// const documentTranslationModel = require("../models/newModel/documentTranslationModel");

// exports.createDocumentTranslation = async (req, res) => {
//   const { superAdminId, _id: createdBy, role } = req.user;
//   const {
//     clientId,
//     steps,
//     sourceLanguage,
//     targetLanguage,
//     nameInTargetScript = "",
//     pages,
//     amount,
//     paidAmount,
//     paymentStatus,
//     paymentMethod,
//     handledBy,
//     deadline,
//     translationStatus,
//     deliveryType,
//     notes,
//   } = req.body;

//   if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
//     console.log("Unauthorized access attempt:", req.user);
//     return res
//       .status(403)
//       .json({ success: false, message: "Unauthorized: Access denied." });
//   }

//   const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;
//   const applicationSteps = steps && Array.isArray(steps) ? steps : [];

//   try {
//     const newTranslation = new documentTranslationModel({
//       superAdminId: clientSuperAdminId,
//       createdBy,
//       clientId,
//       steps: applicationSteps,
//       sourceLanguage,
//       targetLanguage,
//       nameInTargetScript: nameInTargetScript || "",
//       pages,
//       amount,
//       paidAmount,
//       paymentStatus,
//       paymentMethod: paymentStatus === "Paid" ? paymentMethod : undefined,
//       handledBy,
//       deadline,
//       translationStatus,
//       deliveryType,
//       notes: notes || "",
//     });

//     await newTranslation.save();
//     res.status(201).json({
//       success: true,
//       message: "Document translation created successfully",
//       newTranslation,
//     });
//   } catch (error) {
//     console.error("Error creating document translation:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating document translation",
//       error: error.message,
//     });
//   }
// };


// GET All Document Translations for Authenticated Super Admin










const documentTranslationModel = require("../models/newModel/documentTranslationModel");
const notificationController = require("../controllers/notificationController");

exports.createDocumentTranslation = async (req, res) => {
  const { superAdminId, _id: createdBy, fullName: creatorName, role } = req.user;
  const {
    clientId,
    steps,
    sourceLanguage,
    targetLanguage,
    nameInTargetScript = "",
    pages,
    amount,
    paidAmount,
    paymentStatus,
    paymentMethod,
    handledBy,
    deadline,
    translationStatus,
    deliveryType,
    notes,
    handlerId, // Add handlerId
    clientName // Add clientName for notification
  } = req.body;

  if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
    console.log("Unauthorized access attempt:", req.user);
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Access denied." });
  }

  const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;
  const applicationSteps = steps && Array.isArray(steps) ? steps : [];

  try {
    const newTranslation = new documentTranslationModel({
      superAdminId: clientSuperAdminId,
      createdBy,
      clientId,
      steps: applicationSteps,
      sourceLanguage,
      targetLanguage,
      nameInTargetScript: nameInTargetScript || "",
      pages,
      amount,
      paidAmount,
      paymentStatus,
      paymentMethod: paymentStatus === "Paid" ? paymentMethod : undefined,
      handledBy,
      deadline,
      translationStatus,
      deliveryType,
      notes: notes || "",
      handlerId // Store handlerId if needed in DB
    });

    const savedTranslation = await newTranslation.save();

    // Notification logic
    if (handlerId && handlerId !== createdBy.toString()) {
      console.log('Attempting to send notification:', { handlerId, createdBy, clientName });
      try {
        await notificationController.createNotification({
          recipientId: handlerId,
          senderId: createdBy,
          type: 'TASK_ASSIGNED',
          taskId: savedTranslation._id,
          taskModel: 'documentTranslationModel',
          message: `${creatorName || 'Someone'} has assigned you a document translation task for ${clientName || 'a client'}`
        });
        console.log('Notification created successfully for document translation');
      } catch (notificationError) {
        console.error('Failed to create notification for document translation:', notificationError);
      }
    } else {
      console.log('No notification sent: handlerId missing or same as createdBy', { handlerId, createdBy });
    }

    res.status(201).json({
      success: true,
      message: "Document translation created successfully",
      newTranslation: savedTranslation,
    });
  } catch (error) {
    console.error("Error creating document translation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating document translation",
      error: error.message,
    });
  }
};




exports.getAllDocumentTranslation = async (req, res) => {
  const { _id, role, superAdminId } = req.user; // Extract user ID and role from authenticated user

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
    const translations = await documentTranslationModel
      .find(query)
      .populate({
        path: "createdBy", 
        select: "name email", 
      })
      .populate({
        path: "clientId", 
        select: "name email phone", 
      }).sort({ createdAt: -1 }) 
      .exec();

    // If no applications are found, return a 404 error
    if (translations.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No document translation application found",
        });
    }

    // Return the list of applications found
    return res.status(200).json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error(
      "Error fetching document translation applications:",
      error.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// GET Document Translation by ID for Authenticated Super Admin
exports.getDocumentTranslationByID = async (req, res) => {
  const { id } = req.params;
  const { _id: superAdminId } = req.user;

  if (!superAdminId) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    // Find the document that matches the ID and superAdminId
    const translation = await documentTranslationModel
      .findOne({ _id: id, superAdminId })
      .populate("clientId");

    if (!translation) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Document not found or unauthorized to access",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Document fetched successfully",
        translation,
      });
  } catch (error) {
    console.error("Error fetching document translation by ID:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching translation",
        error: error.message,
      });
  }
};


exports.updateDocumentTranslation = async (req, res) => {
  const { id } = req.params; // Document ID
  const { _id: userId, role, superAdminId } = req.user; // Get user info from token

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (role !== 'superadmin' && role !== 'admin') {
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
  }

  const {
    clientId,
    sourceLanguage,
    targetLanguage,
    nameInTargetScript,
    pages,
    amount,
    paidAmount,
    paymentStatus,
    paymentMethod,
    handledBy,
    deadline,
    translationStatus,
    deliveryType,
    notes,
  } = req.body;

  try {
    let query = {};

    if (role === "superadmin") {
      // admin or superadmin: Can update any document under their `superAdminId`
      query = { _id: id, superAdminId: userId };
    } else if (role === "admin") {
      // Admin: Can update documents created by them or under their `admin`
      query = { _id: id, $or: [{ createdBy: userId }, { superAdminId }] };
    }

    // Find and update the document translation based on the query
    const updatedTranslation = await documentTranslationModel.findOneAndUpdate(
      query,
      {
        clientId,
        sourceLanguage,
        targetLanguage,
        nameInTargetScript,
        pages,
        amount,
        paidAmount,
        paymentStatus,
        paymentMethod,
        handledBy,
        deadline,
        translationStatus,
        deliveryType,
        notes,
      },
      { new: true }
    );

    if (!updatedTranslation) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized to update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      updatedTranslation,
    });
  } catch (error) {
    console.error("Error updating document translation:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating translation",
      error: error.message,
    });
  }
};



// DELETE Document Translation by ID for Authenticated Super Admin
exports.deleteDocumentTranslation = async (req, res) => {
  const { id } = req.params;
  const { _id: superAdminId } = req.user;

  if (!superAdminId) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    // Find and delete the document that matches the ID and superAdminId
    const deletedTranslation = await documentTranslationModel.findOneAndDelete({
      _id: id,
      superAdminId,
    });

    if (!deletedTranslation) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Document not found or unauthorized to delete",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document translation:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting translation",
        error: error.message,
      });
  }
};
