


// **********************global search**************************
const applicationModel = require("../models/newModel/applicationModel");
const ClientModel = require("../models/newModel/clientModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");

exports.globalSearch = async (req, res) => {
    const { query } = req.query; 
    const { superAdminId, _id: createdBy, role } = req.user; 

    // Role-based check: Only 'superadmin' or 'admin' are allowed
    if (role !== "superadmin" && role !== "admin") {
        console.log("Unauthorized access attempt:", req.user); 
        return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
    }

    // If the user is a superadmin, use their userId as superAdminId
    const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching

        // Search in ClientModel with superAdminId
        const clients = await ClientModel.find({
            superAdminId: clientSuperAdminId, 
            $or: [
                { name: regex }, 
                { email: regex },
                { phone: regex },
            ],
        }).sort({ name: 1 }); // Sort by name for better priority

        // Search in other models with superAdminId
        const searchModels = [
            { model: applicationModel, key: 'applications' },
            { model: documentTranslationModel, key: 'documentTranslations' },
            { model: ePassportModel, key: 'ePassports' },
            { model: GraphicDesignModel, key: 'graphicDesigns' },
            { model: japanVisitApplicationModel, key: 'japanVisits' },
            { model: OtherServiceModel, key: 'otherServices' },
        ];

        const results = await Promise.all(searchModels.map(async ({ model, key }) => {
            const items = await model.find({ superAdminId: clientSuperAdminId })
                .populate({
                    path: 'clientId',
                    match: { name: regex },
                    select: 'name email phone',
                })
                .exec();
            return { key, items: items.filter(item => item.clientId !== null) };
        }));

        const resultMap = results.reduce((acc, { key, items }) => {
            acc[key] = items;
            return acc;
        }, {});

        res.status(200).json({
            clients,
            ...resultMap,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};