const ePassportModel = require("../models/newModel/ePassportModel");

// Create ePassport
exports.createEpassport = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, role } = req.user;
    const { steps = [], ...otherData } = req.body;

    if (!["superadmin", "admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    const epassport = new ePassportModel({
      ...otherData,
      steps: Array.isArray(steps) ? steps : [],
      superAdminId: role === "superadmin" ? createdBy : superAdminId,
      createdBy,
    });

    await epassport.save();
    res.status(201).json({ success: true, message: "ePassport created successfully", data: epassport });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create ePassport", error: error.message });
  }
};





// Get all ePassports (SuperAdmin & Admin can access each other's data)
exports.getAllEpassports = async (req, res) => {
  try {
    const { _id: userId, role, superAdminId } = req.user;

    if (!role || (role !== "superadmin" && role !== "admin")) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    // Ensure all admins under the same SuperAdmin can see each other's data
    const query = role === "superadmin" ? { superAdminId: userId } : { superAdminId };

    const epassports = await ePassportModel
      .find(query)
      .populate("createdBy", "name email")
      .populate("clientId", "name email phone")
      .sort({createdAt: -1});
    // console.log("Returning ePassports:", epassports) // Debugging log

    res.status(200).json({ success: true, data: epassports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching ePassports", error: error.message });
  }
};



// Get single ePassport
exports.getEpassportById = async (req, res) => {
  try {
    const { _id: userId, role, superAdminId } = req.user;
    const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
    const epassport = await ePassportModel.findOne(query);

    if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
    res.status(200).json({ success: true, data: epassport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





exports.updateEpassport = async (req, res) => {
  try {
    const { _id: userId, role, superAdminId } = req.user;
    const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
    const epassport = await ePassportModel.findOneAndUpdate(query, req.body, { new: true });

    if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
    res.status(200).json({ success: true, message: "ePassport updated successfully", data: epassport });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete ePassport
exports.deleteEpassport = async (req, res) => {
  try {
    const { _id: userId, role, superAdminId } = req.user;
    const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
    const epassport = await ePassportModel.findOneAndDelete(query);

    if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
    res.status(200).json({ success: true, message: "ePassport deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ********************file uploading based on model and client id****************************



const upload = require('../config/multerConfig');
const cloudinary = require('cloudinary').v2;

exports.uploadFileForApplication = [
  upload.array('clientFiles', 5), 
  async (req, res) => {
    try {
      const { clientId } = req.params;
      const { _id: createdBy } = req.user; 
      console.log('Params:', req.params);
      
      if (!clientId) {
        return res.status(404).json({ success: false, message: 'Client ID not found' });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      // Find the application (ePassport) for the specific clientId
      const application = await ePassportModel.findOne({ clientId });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found for this user' });
      }

      // Set the createdBy field (if it's not already set)
      if (!application.createdBy) {
        application.createdBy = createdBy;
      }

      // Process each file and upload to Cloudinary
      const clientFilesUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        clientFilesUrls.push(result.secure_url); 
      }

      // Save the uploaded file URLs in the application model
      application.clientFiles = application.clientFiles || []; 
      application.clientFiles.push(...clientFilesUrls); 

      // Save the updated application data
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
  }
];



const applicationModel = require("../models/newModel/applicationModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
// const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");
const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");


const models = {
  applicationModel,
  japanVisitApplicationModel,
  documentTranslationModel,
  ePassportModel,
  OtherServiceModel,
  GraphicDesignModel,
};

exports.allApplicationFileUpload = [
  upload.array('clientFiles', 5), 
  async (req, res) => {


    try {
      const { clientId, modelName } = req.params; 

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
