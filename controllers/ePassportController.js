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




// ************upload multiple file***********

const upload = require('../config/multerConfig');
const cloudinary = require('cloudinary').v2;

exports.uploadFileForApplication = [
  upload.array('clientFiles', 5), // Handling multiple file uploads (max 5 files)
  async (req, res) => {
    try {
      const { clientId } = req.params; 
      // console.log(clientId)
      console.log('Params:', req.params);


      if(!clientId){
        return res.status(404).json({success : false, message: 'client id not found'})
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      // Find the application (ePassport) for the specific clientId
      // const application = await ePassportModel.find(clientId );
      const application = await ePassportModel.findOne({ clientId });


      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found for this user' });
      }

      // Process each file and upload to Cloudinary
      const clientFilesUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        clientFilesUrls.push(result.secure_url); // Collect all the uploaded file URLs
      }

      // Save the uploaded file URLs in the application model
      application.clientFiles = application.clientFiles || []; // Initialize the files array if not already
      application.clientFiles.push(...clientFilesUrls); // Add the new file URLs

      // Save the updated application data
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        fileUrls: clientFilesUrls, // Return the list of URLs to the client
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({ success: false, message: 'Server error while uploading files' });
    }
  }
];

















// ********************file uploading based on model and client id****************************
const applicationModel = require("../models/newModel/applicationModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
// const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");
const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");



// *****************file upload testring**************


const models = {
  applicationModel,
  japanVisitApplicationModel,
  documentTranslationModel,
  ePassportModel,
  OtherServiceModel,
  GraphicDesignModel,
};

exports.allApplicationFileUpload = [
  upload.array('clientFiles', 5), // Handling multiple file uploads (max 5 files)
  async (req, res) => {
    try {
      const { clientId, modelName } = req.params; // Get clientId and modelName from params

      if (!clientId || !modelName) {
        return res.status(400).json({ success: false, message: 'clientId and modelName are required' });
      }

      const Model = models[modelName]; // Dynamically select the model
      if (!Model) {
        return res.status(404).json({ success: false, message: 'Invalid model name' });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      // Find the specific application/model data for the client
      const application = await Model.findOne({ clientId });

      if (!application) {
        return res.status(404).json({ success: false, message: `No ${modelName} found for this client` });
      }

      // Upload files to Cloudinary and collect URLs
      const clientFilesUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        clientFilesUrls.push(result.secure_url);
      }

      // Update the `clientFiles` array for the application
      application.clientFiles = application.clientFiles || [];
      application.clientFiles.push(...clientFilesUrls);

      // Save the updated data
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        fileUrls: clientFilesUrls,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({ success: false, message: 'Server error while uploading files' });
    }
  },
];








exports.deleteFile = async (req, res) => {
  try {
    const { clientId, modelName, fileUrl } = req.body;

    if (!clientId || !modelName || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Missing required parameters.' });
    }

    const Model = models[modelName];
    if (!Model) {
      return res.status(404).json({ success: false, message: 'Invalid model name.' });
    }

    const application = await Model.findOne({ clientId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Extract public ID from Cloudinary URL
    const publicId = fileUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // Remove URL from database
    application.clientFiles = application.clientFiles.filter((url) => url !== fileUrl);
    await application.save();

    res.status(200).json({ success: true, message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
