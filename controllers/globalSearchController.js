


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

    if (role !== "superadmin" && role !== "admin") {
        console.log("Unauthorized access attempt:", req.user); 
        return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
    }

    const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching

        // ✅ Step 1: Find Matching Clients
        const clients = await ClientModel.find({
            superAdminId: clientSuperAdminId,
            $or: [{ name: regex }, { email: regex }, { phone: regex }],
        }).sort({ name: 1 });

        // Get IDs of matching clients
        const clientIds = clients.map(client => client._id);

        // ✅ Step 2: Search in Other Models
        const searchModels = [
            { model: applicationModel, key: 'applications', fields: ['applicationStatus', 'referenceNumber'] },
            { model: documentTranslationModel, key: 'translations', fields: ['documentType', 'translationStatus'] },
            { model: ePassportModel, key: 'epassport', fields: ['passportNumber', 'applicationStatus'] },
            { model: GraphicDesignModel, key: 'designs', fields: ['projectName', 'status'] },
            { model: japanVisitApplicationModel, key: 'japanVisit', fields: ['visaType', 'applicationStatus'] },
            { model: OtherServiceModel, key: 'otherServices', fields: ['serviceType', 'status'] },
        ];

        const results = await Promise.all(searchModels.map(async ({ model, key, fields }) => {
            const queryConditions = [
                { clientId: { $in: clientIds } },  // ✅ Match clients by ID
                ...fields.map(field => ({ [field]: regex })) // ✅ Match by other fields
            ];

            const items = await model.find({
                superAdminId: clientSuperAdminId,
                $or: queryConditions
            }).populate({
                path: 'clientId',
                select: 'name email phone',
            }).exec();

            return { key, items };
        }));

        // ✅ Format Results
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


