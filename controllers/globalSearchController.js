


// **********************global search**************************

const applicationModel = require("../models/newModel/applicationModel");
const ClientModel = require("../models/newModel/clientModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");

exports.globalSearch = async (req, res) => {
    const { query } = req.query; // Use req.query for GET requests
    const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
  
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }
  
    try {
      const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching
  
      // Search in ClientModel with superAdminId
      const clients = await ClientModel.find({
        superAdminId,  // Add superAdminId check
        $or: [
          { name: regex }, 
          { email: regex },
          { phone: regex },
        ],
      });
  
      // Search in applicationModel with superAdminId
      const applications = await applicationModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredApplications = applications.filter(app => app.clientId !== null);
  
      // Search in documentTranslationModel with superAdminId
      const documentTranslations = await documentTranslationModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredDocumentTranslations = documentTranslations.filter(dt => dt.clientId !== null);
  
      // Search in ePassportModel with superAdminId
      const ePassports = await ePassportModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredEPassports = ePassports.filter(ep => ep.clientId !== null);
  
      // Search in GraphicDesignModel with superAdminId
      const graphicDesigns = await GraphicDesignModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredGraphicDesigns = graphicDesigns.filter(gd => gd.clientId !== null);
  
      // Search in japanVisitApplicationModel with superAdminId
      const japanVisits = await japanVisitApplicationModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredJapanVisits = japanVisits.filter(jv => jv.clientId !== null);
  
      // Search in OtherServiceModel with superAdminId
      const otherServices = await OtherServiceModel.find({ superAdminId })
        .populate({
          path: 'clientId',
          match: { name: regex },
          select: 'name email phone',
        })
        .exec();
      const filteredOtherServices = otherServices.filter(os => os.clientId !== null);
  
      res.status(200).json({
        clients,
        applications: filteredApplications,
        documentTranslations: filteredDocumentTranslations,
        ePassports: filteredEPassports,
        graphicDesigns: filteredGraphicDesigns,
        japanVisits: filteredJapanVisits,
        otherServices: filteredOtherServices,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  