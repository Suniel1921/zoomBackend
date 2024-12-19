// const ePassportModel = require("../models/newModel/ePassportModel");
// // const EpassportStepModel = require("../models/newModel/steps/ePassportStepModel");


// // Create a new ePassport application
// exports.createEpassport = async (req, res) => {
//   try {
//     const epassport = new ePassportModel(req.body);
//     await epassport.save();
//     res.status(201).json({success: true, message: 'epassport data created', data: epassport,});
//   } catch (error) {
//     res.status(400).json({success: false, message: error.message,});
//   }
// };

// // Get all ePassport applications
// exports.getAllEpassports = async (req, res) => {
//   try {
//     const epassports = await ePassportModel.find().populate('clientId');
//     if (epassports.length === 0) {
//       return res.status(404).json({success: false, message: 'No ePassport applications found',});
//     }
//     res.status(200).json({success: true, message: 'ePassport application data fected', data: epassports,});
//   } catch (error) {
//     res.status(500).json({success: false, message: error.message,});
//   }
// };

// // Get a single ePassport application by ID
// exports.getEpassportById = async (req, res) => {
//   try {
//     const epassport = await ePassportModel.findById(req.params.id);
//     if (!epassport) {
//       return res.status(404).json({success: false, message: 'ePassport not found',});
//     }
//     res.status(200).json({success: true, data: epassport,});
//   } catch (error) {res.status(500).json({success: false, message: error.message,});
//   }
// };

// // Update an ePassport application
// exports.updateEpassport = async (req, res) => {
//   try {
//     const epassport = await ePassportModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!epassport) {
//       return res.status(404).json({success: false, message: 'ePassport not found',});
//     }
//     res.status(200).json({success: true, message: 'epassport data updated successfully', data: epassport,});
//   } catch (error) {
//     res.status(400).json({success: false, message: error.message,});
//   }
// };

// // Delete an ePassport application
// exports.deleteEpassport = async (req, res) => {
//   try {
//     const epassport = await ePassportModel.findByIdAndDelete(req.params.id);
//     if (!epassport) {
//       return res.status(404).json({success: false, message: 'ePassport not found',});
//     }
//     res.status(200).json({success: true, message: 'ePassport deleted successfully',});
//   } catch (error) {
//     res.status(500).json({success: false, message: error.message,});
//   }
// };


// // *************************epassport step***********************



// // // Controller to handle creating a new application step with an object structure for stepNames
// // exports.createEPassportStep = async (req, res) => {
// //   try {
// //     const { clientId, stepNames } = req.body;

// //     // Validate required fields
// //     if (!clientId) {
// //       return res.status(400).json({ success: false, message: 'clientId is required' });
// //     }

// //     if (typeof stepNames !== 'object' || Object.keys(stepNames).length === 0) {
// //       return res.status(400).json({ success: false, message: 'stepNames must be a non-empty object' });
// //     }

// //     // Create a new ApplicationStep document
// //     const newStep = new EpassportStepModel({
// //       clientId,  // Make sure clientId is saved at the top level
// //       stepNames,
// //     });

// //     // Save the step to the database
// //     const savedStep = await newStep.save();

// //     // Return the saved step as a response
// //     res.status(201).json(savedStep);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ success: false, message: 'Internal Server Error', error });
// //   }
// // };


// // // Controller to handle updating the status of a specific step
// // exports.updateEpassportStepStatus = async (req, res) => {
// //   try {
// //     const { step, status } = req.body;
// //     const clientId = req.params.id;

// //     if (!step || !status) {
// //       return res.status(400).json({ success: false, message: 'Step or status missing.' });
// //     }

// //     const updated = await EpassportStepModel.findOneAndUpdate(
// //       { 'clientId': clientId },
// //       { [`stepNames.${step}.status`]: status },
// //       { new: true }
// //     );

// //     if (!updated) {
// //       return res.status(404).json({ success: false, message: 'Client or step not found.' });
// //     }

// //     res.status(200).json({ success: true, data: updated });
// //   } catch (error) {
// //     console.error('Error updating status:', error);
// //     res.status(500).json({ success: false, message: 'Server error.' });
// //   }
// // };















const ePassportModel = require("../models/newModel/ePassportModel");
// const EpassportStepModel = require("../models/newModel/steps/ePassportStepModel");

// Create a new ePassport application
// exports.createEpassport = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; // Extract superAdminId from authenticated user
//     const epassport = new ePassportModel({ ...req.body, superAdminId });
//     await epassport.save();
//     res.status(201).json({
//       success: true,
//       message: "ePassport data created",
//       data: epassport,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


exports.createEpassport = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Extract superAdminId from authenticated user
    const { steps, ...otherData } = req.body; // Destructure `steps` and other fields from the request body

    // Validate steps: Ensure it's an array or default to an empty array
    const applicationSteps = Array.isArray(steps) ? steps : [];

    // Create ePassport instance with validated steps and other data
    const epassport = new ePassportModel({
      ...otherData,
      steps: applicationSteps,
      superAdminId,
    });

    // Save to the database
    await epassport.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "ePassport data created successfully",
      data: epassport,
    });
  } catch (error) {
    console.error("Error creating ePassport:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create ePassport data",
      error: error.message,
    });
  }
};


// Get all ePassport applications for authenticated superAdmin
exports.getAllEpassports = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const epassports = await ePassportModel
      .find({ superAdminId }) // Filter by superAdminId
      .populate("clientId");

    if (epassports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No ePassport applications found" });
    }
    res.status(200).json({
      success: true,
      message: "ePassport application data fetched",
      data: epassports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single ePassport application by ID for authenticated superAdmin
exports.getEpassportById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const epassport = await ePassportModel.findOne({
      _id: req.params.id,
      superAdminId,
    });

    if (!epassport) {
      return res
        .status(404)
        .json({ success: false, message: "ePassport not found" });
    }
    res.status(200).json({ success: true, data: epassport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an ePassport application for authenticated superAdmin
exports.updateEpassport = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;

    const epassport = await ePassportModel.findOneAndUpdate(
      { _id: req.params.id, superAdminId },
      req.body,
      { new: true }
    );

    if (!epassport) {
      return res
        .status(404)
        .json({ success: false, message: "ePassport not found" });
    }
    res.status(200).json({
      success: true,
      message: "ePassport data updated successfully",
      data: epassport,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an ePassport application for authenticated superAdmin
exports.deleteEpassport = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;

    const epassport = await ePassportModel.findOneAndDelete({
      _id: req.params.id,
      superAdminId,
    });

    if (!epassport) {
      return res
        .status(404)
        .json({ success: false, message: "ePassport not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "ePassport deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ************************* ePassport Step ***********************

// Controller to create ePassport steps with superAdminId check
// exports.createEPassportStep = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;
//     const { clientId, stepNames } = req.body;

//     if (!clientId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "clientId is required" });
//     }

//     if (typeof stepNames !== "object" || Object.keys(stepNames).length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "stepNames must be a non-empty object" });
//     }

//     const newStep = new EpassportStepModel({
//       clientId,
//       superAdminId, // Attach superAdminId
//       stepNames,
//     });

//     const savedStep = await newStep.save();
//     res.status(201).json({ success: true, data: savedStep });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error", error });
//   }
// };

// // Controller to update ePassport step status with superAdminId check
// exports.updateEpassportStepStatus = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;
//     const { step, status } = req.body;
//     const clientId = req.params.id;

//     if (!step || !status) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Step or status missing." });
//     }

//     const updated = await EpassportStepModel.findOneAndUpdate(
//       { clientId, superAdminId },
//       { [`stepNames.${step}.status`]: status },
//       { new: true }
//     );

//     if (!updated) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Client or step not found." });
//     }

//     res.status(200).json({ success: true, data: updated });
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };

