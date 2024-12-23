const ePassportModel = require("../models/newModel/ePassportModel");


exports.createEpassport = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 
    const { steps, ...otherData } = req.body; 

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
      .find({ superAdminId }) 
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



