const ePassportModel = require("../models/newModel/ePassportModel");
const EpassportStepModel = require("../models/newModel/steps/ePassportStepModel");


// Create a new ePassport application
exports.createEpassport = async (req, res) => {
  try {
    const epassport = new ePassportModel(req.body);
    await epassport.save();
    res.status(201).json({success: true, message: 'epassport data created', data: epassport,});
  } catch (error) {
    res.status(400).json({success: false, message: error.message,});
  }
};

// Get all ePassport applications
exports.getAllEpassports = async (req, res) => {
  try {
    const epassports = await ePassportModel.find().populate('clientId');
    if (epassports.length === 0) {
      return res.status(404).json({success: false, message: 'No ePassport applications found',});
    }
    res.status(200).json({success: true, message: 'ePassport application data fected', data: epassports,});
  } catch (error) {
    res.status(500).json({success: false, message: error.message,});
  }
};

// Get a single ePassport application by ID
exports.getEpassportById = async (req, res) => {
  try {
    const epassport = await ePassportModel.findById(req.params.id);
    if (!epassport) {
      return res.status(404).json({success: false, message: 'ePassport not found',});
    }
    res.status(200).json({success: true, data: epassport,});
  } catch (error) {res.status(500).json({success: false, message: error.message,});
  }
};

// Update an ePassport application
exports.updateEpassport = async (req, res) => {
  try {
    const epassport = await ePassportModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!epassport) {
      return res.status(404).json({success: false, message: 'ePassport not found',});
    }
    res.status(200).json({success: true, message: 'epassport data updated successfully', data: epassport,});
  } catch (error) {
    res.status(400).json({success: false, message: error.message,});
  }
};

// Delete an ePassport application
exports.deleteEpassport = async (req, res) => {
  try {
    const epassport = await ePassportModel.findByIdAndDelete(req.params.id);
    if (!epassport) {
      return res.status(404).json({success: false, message: 'ePassport not found',});
    }
    res.status(200).json({success: true, message: 'ePassport deleted successfully',});
  } catch (error) {
    res.status(500).json({success: false, message: error.message,});
  }
};


// *************************epassport step***********************



// Controller to handle creating a new application step with an object structure for stepNames
exports.createEPassportStep = async (req, res) => {
  try {
    const { clientId, stepNames } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId is required' });
    }

    if (typeof stepNames !== 'object' || Object.keys(stepNames).length === 0) {
      return res.status(400).json({ success: false, message: 'stepNames must be a non-empty object' });
    }

    // Create a new ApplicationStep document
    const newStep = new EpassportStepModel({
      clientId,  // Make sure clientId is saved at the top level
      stepNames,
    });

    // Save the step to the database
    const savedStep = await newStep.save();

    // Return the saved step as a response
    res.status(201).json(savedStep);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};


// Controller to handle updating the status of a specific step
exports.updateEpassportStepStatus = async (req, res) => {
  try {
    const { step, status } = req.body;
    const clientId = req.params.id;

    if (!step || !status) {
      return res.status(400).json({ success: false, message: 'Step or status missing.' });
    }

    const updated = await EpassportStepModel.findOneAndUpdate(
      { 'clientId': clientId },
      { [`stepNames.${step}.status`]: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Client or step not found.' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
