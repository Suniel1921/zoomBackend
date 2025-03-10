const mongoose = require("mongoose");
const defaultSteps = require("./defaultSteps");

const additionalClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationType: {
    type: String,
    enum: [
      "Newborn Child",
      "Passport Renewal",
      "Lost Passport",
      "Damaged Passport",
      "Travel Document",
      "Birth Registration",
    ],
    required: true,
  },
});

const epassportSchema = new mongoose.Schema(
  {
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SuperAdminModel",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminModel",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ClientModel",
    },
    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "completed", "in-progress", "processing"],
          default: "completed",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    mobileNo: { type: String, required: true },
    contactChannel: {
      type: String,
      enum: ["Viber", "Facebook", "WhatsApp", "Friend", "Office Visit"],
      required: true,
    },
    applicationType: {
      type: String,
      enum: [
        "Newborn Child",
        "Passport Renewal",
        "Lost Passport",
        "Damaged Passport",
        "Travel Document",
        "Birth Registration",
      ],
      required: true,
    },
    ghumtiService: { type: Boolean, required: true },
    prefecture: { type: String, required: false },
    amount: { type: Number, min: 0, required: true },
    paidAmount: { type: Number, min: 0, required: true },
    dueAmount: { type: Number, min: 0, required: true },
    discount: { type: Number, min: 0, required: true },
    paymentStatus: {
      type: String,
      enum: ["Due", "Partial", "Paid"],
      required: true,
    },
 
    paymentMethod: {
      type: String,
      enum: ["Bank Furicomy", "Counter Cash", "Credit Card", "Paypay"],
      required: false,
    },

    
    applicationStatus: {
      type: String,
      enum: ["Processing", "Waiting for Payment", "Completed", "Cancelled"],
      required: true,
    },
    dataSentStatus: {
      type: String,
      enum: ["Not Sent", "Sent"],
      required: true,
    },
    handledBy: { type: String },
    date: { type: Date, required: true },
    deadline: { type: Date, required: true },
    remarks: { type: String, required: false },
    clientFiles: { type: [String], default: [] },
    additionalClients: { type: [additionalClientSchema], default: [] },
  },
  { timestamps: true }
);

epassportSchema.pre("save", function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.ePassportStep;
  }
  next();
});

const ePassportModel = mongoose.model("ePassportModel", epassportSchema);
module.exports = ePassportModel;













// *******************************************


// const mongoose = require("mongoose");
// const defaultSteps = require("./defaultSteps");

// const additionalClientSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   applicationType: {
//     type: String,
//     enum: [
//       "Newborn Child",
//       "Passport Renewal",
//       "Lost Passport",
//       "Damaged Passport",
//       "Travel Document",
//       "Birth Registration",
//     ],
//     required: true,
//   },
// });

// const epassportSchema = new mongoose.Schema(
//   {
//     superAdminId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "SuperAdminModel",
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AdminModel",
//       required: true,
//     },
//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "ClientModel",
//     },
//     steps: [
//       {
//         name: { type: String, required: true },
//         status: {
//           type: String,
//           enum: ["pending", "completed", "in-progress", "processing"],
//           default: "completed",
//         },
//         updatedAt: { type: Date, default: Date.now },
//       },
//     ],
//     mobileNo: { type: String, required: true },
//     contactChannel: {
//       type: String,
//       enum: ["Viber", "Facebook", "WhatsApp", "Friend", "Office Visit"],
//       required: true,
//     },
//     applicationType: {
//       type: String,
//       enum: [
//         "Newborn Child",
//         "Passport Renewal",
//         "Lost Passport",
//         "Damaged Passport",
//         "Travel Document",
//         "Birth Registration",
//       ],
//       required: true,
//     },
//     ghumtiService: { type: Boolean, required: true },
//     prefecture: { type: String, required: false },
//     amount: { type: Number, min: 0, required: true },
//     paidAmount: { type: Number, min: 0, required: true },
//     dueAmount: { type: Number, min: 0, required: true },
//     discount: { type: Number, min: 0, required: true },
//     paymentStatus: {
//       type: String,
//       enum: ["Due", "Partial", "Paid"],
//       required: true,
//     },
 
//     paymentMethod: {
//       type: String,
//       enum: ["Bank Furicomy", "Counter Cash", "Credit Card", "Paypay"],
//       required: false,
//     },

    
//     applicationStatus: {
//       type: String,
//       enum: ["Processing", "Waiting for Payment", "Completed", "Cancelled"],
//       required: true,
//     },
//     dataSentStatus: {
//       type: String,
//       enum: ["Not Sent", "Sent"],
//       required: true,
//     },
//     handledBy: { type: String },
//     date: { type: Date, required: true },
//     deadline: { type: Date, required: true },
//     remarks: { type: String, required: false },
//     clientFiles: { type: [String], default: [] },
//     additionalClients: { type: [additionalClientSchema], default: [] },
//   },
//   { timestamps: true }
// );

// epassportSchema.pre("save", function (next) {
//   if (!this.steps || this.steps.length === 0) {
//     this.steps = defaultSteps.ePassportStep;
//   }
//   next();
// });

// const ePassportModel = mongoose.model("ePassportModel", epassportSchema);
// module.exports = ePassportModel;





// const express = require ('express');
// const router = express.Router();
// const controller = require ('../../controllers/ePassportController');
// const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


// router.get('/getAllePassports', requireLogin, controller.getAllEpassports);
// router.get('/getePassportByID/:id',  requireLogin, controller.getEpassportById);
// router.post('/createEpassport', requireLogin, controller.createEpassport);
// router.put('/updateEpassport/:id',  requireLogin, controller.updateEpassport);
// router.delete('/deleteEpassport/:id',  requireLogin, controller.deleteEpassport);

// // **file upload route**
// router.post('/uploadMultipleFiles/:clientId', requireLogin, controller.uploadFileForApplication);

// // *****file upload route for all mode based on model name (this api route called in FileTab component)****
// router.post('/fileUpload/:clientId/:modelName', controller.allApplicationFileUpload);
// // router.delete('/deleteClientFile/:clientId/:modelName/:fileUrl', controller.deleteClientFile);
// router.delete('/deleteFile', controller.deleteFile);



// module.exports = router;



// const ePassportModel = require("../models/newModel/ePassportModel");

// // Create ePassport
// exports.createEpassport = async (req, res) => {
//   try {
//     const { superAdminId, _id: createdBy, role } = req.user;
//     const { steps = [], ...otherData } = req.body;

//     if (!["superadmin", "admin"].includes(role)) {
//       return res.status(403).json({ success: false, message: "Unauthorized access." });
//     }

//     const epassport = new ePassportModel({
//       ...otherData,
//       steps: Array.isArray(steps) ? steps : [],
//       superAdminId: role === "superadmin" ? createdBy : superAdminId,
//       createdBy,
//     });

//     await epassport.save();
//     res.status(201).json({ success: true, message: "ePassport created successfully", data: epassport });
//   } catch (error) {
//     res.status(400).json({ success: false, message: "Failed to create ePassport", error: error.message });
//   }
// };





// // Get all ePassports (SuperAdmin & Admin can access each other's data)
// exports.getAllEpassports = async (req, res) => {
//   try {
//     const { _id: userId, role, superAdminId } = req.user;

//     if (!role || (role !== "superadmin" && role !== "admin")) {
//       return res.status(403).json({ success: false, message: "Unauthorized access." });
//     }

//     // Ensure all admins under the same SuperAdmin can see each other's data
//     const query = role === "superadmin" ? { superAdminId: userId } : { superAdminId };

//     const epassports = await ePassportModel
//       .find(query)
//       .populate("createdBy", "name email")
//       .populate("clientId", "name email phone")
//       .sort({createdAt: -1});
//     // console.log("Returning ePassports:", epassports) // Debugging log

//     res.status(200).json({ success: true, data: epassports });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching ePassports", error: error.message });
//   }
// };



// // Get single ePassport
// exports.getEpassportById = async (req, res) => {
//   try {
//     const { _id: userId, role, superAdminId } = req.user;
//     const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
//     const epassport = await ePassportModel.findOne(query);

//     if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
//     res.status(200).json({ success: true, data: epassport });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };





// exports.updateEpassport = async (req, res) => {
//   try {
//     const { _id: userId, role, superAdminId } = req.user;
//     const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
//     const epassport = await ePassportModel.findOneAndUpdate(query, req.body, { new: true });

//     if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
//     res.status(200).json({ success: true, message: "ePassport updated successfully", data: epassport });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete ePassport
// exports.deleteEpassport = async (req, res) => {
//   try {
//     const { _id: userId, role, superAdminId } = req.user;
//     const query = role === "superadmin" ? { _id: req.params.id, superAdminId: userId } : { _id: req.params.id, superAdminId };
//     const epassport = await ePassportModel.findOneAndDelete(query);

//     if (!epassport) return res.status(404).json({ success: false, message: "ePassport not found" });
//     res.status(200).json({ success: true, message: "ePassport deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// // ********************file uploading based on model and client id****************************





// const upload = require('../config/multerConfig');
// const cloudinary = require('cloudinary').v2;

// exports.uploadFileForApplication = [
//   upload.array('clientFiles', 5), 
//   async (req, res) => {
//     try {
//       const { clientId } = req.params;
//       const { _id: createdBy } = req.user; 
//       console.log('Params:', req.params);
      
//       if (!clientId) {
//         return res.status(404).json({ success: false, message: 'Client ID not found' });
//       }

//       // Check if files were uploaded
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No files uploaded' });
//       }

//       // Find the application (ePassport) for the specific clientId
//       const application = await ePassportModel.findOne({ clientId });

//       if (!application) {
//         return res.status(404).json({ success: false, message: 'Application not found for this user' });
//       }

//       // Set the createdBy field (if it's not already set)
//       if (!application.createdBy) {
//         application.createdBy = createdBy;
//       }

//       // Fix paymentMethod if it's an empty string
//       if (application.paymentMethod === '') {
//         application.paymentMethod = undefined;
//       }

//       // Process each file and upload to Cloudinary
//       const clientFilesUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         clientFilesUrls.push(result.secure_url); 
//       }

//       // Save the uploaded file URLs in the application model
//       application.clientFiles = application.clientFiles || []; 
//       application.clientFiles.push(...clientFilesUrls); 

//       // Save the updated application data
//       await application.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Files uploaded successfully',
//         fileUrls: clientFilesUrls, 
//       });
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       return res.status(500).json({ success: false, message: 'Server error while uploading files' });
//     }
//   }
// ];



// const applicationModel = require("../models/newModel/applicationModel");
// const documentTranslationModel = require("../models/newModel/documentTranslationModel");
// // const ePassportModel = require("../models/newModel/ePassportModel"); //yo already mathi (TOP ma) declear xa 
// const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
// const OtherServiceModel = require("../models/newModel/otherServicesModel");
// const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");


// const models = {
//   applicationModel,
//   japanVisitApplicationModel,
//   documentTranslationModel,
//   ePassportModel,
//   OtherServiceModel,
//   GraphicDesignModel,
// };

// exports.allApplicationFileUpload = [
//   upload.array('clientFiles', 5), 
//   async (req, res) => {


//     try {
//       const { clientId, modelName } = req.params; 

//       if (!clientId || !modelName) {
//         return res.status(400).json({ success: false, message: 'clientId and modelName are required' });
//       }

//       const Model = models[modelName]; // Dynamically select the model
//       if (!Model) {
//         return res.status(404).json({ success: false, message: 'Invalid model name' });
//       }

//       // Check if files were uploaded
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No files uploaded' });
//       }

//       // Find the specific application/model data for the client
//       const application = await Model.findOne({ clientId });

//       if (!application) {
//         return res.status(404).json({ success: false, message: `No ${modelName} found for this client` });
//       }

//       // Upload files to Cloudinary and collect URLs
//       const clientFilesUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         clientFilesUrls.push(result.secure_url);
//       }

//       // Update the `clientFiles` array for the application
//       application.clientFiles = application.clientFiles || [];
//       application.clientFiles.push(...clientFilesUrls);

//       // Save the updated data
//       await application.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Files uploaded successfully',
//         fileUrls: clientFilesUrls,
//       });
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       return res.status(500).json({ success: false, message: 'Server error while uploading files' });
//     }
//   },
// ];








// exports.deleteFile = async (req, res) => {
//   try {
//     const { clientId, modelName, fileUrl } = req.body;

//     if (!clientId || !modelName || !fileUrl) {
//       return res.status(400).json({ success: false, message: 'Missing required parameters.' });
//     }

//     const Model = models[modelName];
//     if (!Model) {
//       return res.status(404).json({ success: false, message: 'Invalid model name.' });
//     }

//     const application = await Model.findOne({ clientId });
//     if (!application) {
//       return res.status(404).json({ success: false, message: 'Application not found.' });
//     }

//     // Extract public ID from Cloudinary URL
//     const publicId = fileUrl.split('/').pop().split('.')[0];
//     await cloudinary.uploader.destroy(publicId);

//     // Remove URL from database
//     application.clientFiles = application.clientFiles.filter((url) => url !== fileUrl);
//     await application.save();

//     res.status(200).json({ success: true, message: 'File deleted successfully.' });
//   } catch (error) {
//     console.error('Error deleting file:', error);
//     res.status(500).json({ success: false, message: 'Server error.' });
//   }
// };
// import { useEffect, useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { X } from "lucide-react";
// import Button from "../../components/Button";
// import Input from "../../components/Input";
// import SearchableSelect from "../../components/SearchableSelect";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { PREFECTURES } from "../../constants/prefectures";
// import axios from "axios";
// import toast from "react-hot-toast";

// export default function AddEpassportModal({
//   isOpen,
//   onClose,
//   getAllEPassportApplication,
// }) {
//   const [showPrefecture, setShowPrefecture] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [handlers, setHandlers] = useState([]);
//   const [showAdditionalClients, setShowAdditionalClients] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     control,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       ghumtiService: false,
//       paymentStatus: "Due",
//       applicationStatus: "Processing",
//       dataSentStatus: "Not Sent",
//       amount: 0,
//       paidAmount: 0,
//       dueAmount: 0,
//       discount: 0,
//       date: new Date(),
//       deadline: new Date(),
//       additionalClients: [],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "additionalClients",
//   });

//   const ghumtiService = watch("ghumtiService");
//   const amount = watch("amount") || 0;
//   const paidAmount = watch("paidAmount") || 0;
//   const discount = watch("discount") || 0;
//   const dueAmount = amount - (paidAmount + discount);
//   const clientId = watch("clientId");
//   const selectedClient = clients.find((c) => c._id === clientId);

//   useEffect(() => {
//     const fetchHandlers = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
//         );
//         setHandlers(response.data.admins || []);
//       } catch (error) {
//         toast.error("Failed to fetch handlers.");
//       }
//     };
//     fetchHandlers();
//   }, []);

//   useEffect(() => {
//     if (isOpen) {
//       axios
//         .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
//         .then((response) => {
//           const clientsData = response?.data?.clients;
//           setClients(Array.isArray(clientsData) ? clientsData : [clientsData]);
//         })
//         .catch((error) => {
//           console.error("Error fetching clients:", error);
//           setClients([]);
//         });
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (showAdditionalClients && fields.length === 0) {
//       append({ name: "", applicationType: "" });
//     }
//   }, [showAdditionalClients, fields.length, append]);

//   const onSubmit = async (data) => {
//     try {
//       const client = clients.find((c) => c._id === data.clientId);
//       if (!client) {
//         toast.error("Please Select Client Name");
//         return;
//       }

//       const formData = {
//         ...data,
//         clientName: client.name,
//         mobileNo: client.phone,
//         date: data.date.toISOString(),
//         deadline: data.deadline.toISOString(),
//         dueAmount,
//         paymentMethod: data.paymentMethod === "" ? undefined : data.paymentMethod,        
//         additionalClients: data.additionalClients,
//       };

//       const response = await axios.post(
//         `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/createEpassport`,
//         formData
//       );
      
//       if (response.data.success) {
//         toast.success(response.data.message);
//         reset();
//         onClose();
//         getAllEPassportApplication();
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Error creating application");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">New ePassport Application</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Client Information</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Client</label>
//                 <SearchableSelect
//                   options={clients.map((client) => ({
//                     value: client._id,
//                     label: client.name,
//                     clientData: { ...client, profilePhoto: client.profilePhoto },
//                   }))}
//                   value={clientId}
//                   onChange={(value) => {
//                     setValue("clientId", value);
//                     const client = clients.find((c) => c._id === value);
//                     if (client) setValue("mobileNo", client.phone);
//                   }}
//                   placeholder="Select client"
//                   className="mt-1"
//                   error={errors.clientId?.message}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                 <Input value={selectedClient?.phone || ""} className="mt-1 bg-gray-50" disabled />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Contact Channel</label>
//                 <select
//                   {...register("contactChannel")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="Viber">Viber</option>
//                   <option value="Facebook">Facebook</option>
//                   <option value="WhatsApp">WhatsApp</option>
//                   <option value="Friend">Friend</option>
//                   <option value="Office Visit">Office Visit</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Application Details</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Application Type</label>
//                 <select
//                   {...register("applicationType")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="Newborn Child">Newborn Child</option>
//                   <option value="Passport Renewal">Passport Renewal</option>
//                   <option value="Lost Passport">Lost Passport</option>
//                   <option value="Damaged Passport">Damaged Passport</option>
//                   <option value="Travel Document">Travel Document</option>
//                   <option value="Birth Registration">Birth Registration</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Handled By</label>
//                 <select
//                   {...register("handledBy", { required: "This field is required" })}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="">Select handler</option>
//                   {handlers.map((handler) => (
//                     <option key={handler.id} value={handler.name}>
//                       {handler.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.handledBy && (
//                   <p className="mt-1 text-sm text-red-600">{errors.handledBy.message}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Job Status</label>
//                 <select
//                   {...register("applicationStatus")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="Processing">Processing</option>
//                   <option value="Waiting for Payment">Waiting for Payment</option>
//                   <option value="Completed">Completed</option>
//                   <option value="Cancelled">Cancelled</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Data Sent Status</label>
//                 <select
//                   {...register("dataSentStatus")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="Not Sent">Not Sent</option>
//                   <option value="Sent">Sent</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Date</label>
//                 <DatePicker
//                   selected={watch("date")}
//                   onChange={(date) => setValue("date", date)}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                   dateFormat="yyyy-MM-dd"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Deadline</label>
//                 <DatePicker
//                   selected={watch("deadline")}
//                   onChange={(date) => setValue("deadline", date)}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                   dateFormat="yyyy-MM-dd"
//                 />
//               </div>
//               <div className="col-span-2">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     {...register("ghumtiService")}
//                     onChange={(e) => {
//                       setValue("ghumtiService", e.target.checked);
//                       setShowPrefecture(e.target.checked);
//                       if (!e.target.checked) setValue("prefecture", undefined);
//                     }}
//                     className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <span className="text-sm text-gray-700">Ghumti Service</span>
//                 </label>
//               </div>
//               {ghumtiService && (
//                 <div className="col-span-2">
//                   <label className="block text-sm font-medium text-gray-700">Prefecture</label>
//                   <select
//                     {...register("prefecture")}
//                     className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                   >
//                     <option value="">Select prefecture</option>
//                     {PREFECTURES.map((prefecture) => (
//                       <option key={prefecture} value={prefecture}>
//                         {prefecture}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//               <div className="col-span-2">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     onChange={(e) => {
//                       setShowAdditionalClients(e.target.checked);
//                       if (!e.target.checked) remove();
//                     }}
//                     className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <span className="text-sm text-gray-700">Additional Clients</span>
//                 </label>
//               </div>
//               {showAdditionalClients && (
//                 <div className="col-span-2 space-y-4">
//                   {fields.map((field, index) => (
//                     <div key={field.id} className="flex gap-4 items-end">
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700">Name</label>
//                         <Input
//                           {...register(`additionalClients.${index}.name`, { required: "Name is required" })}
//                           className="mt-1"
//                         />
//                         {errors.additionalClients?.[index]?.name && (
//                           <p className="mt-1 text-sm text-red-600">{errors.additionalClients[index].name.message}</p>
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700">Application Type</label>
//                         <select
//                           {...register(`additionalClients.${index}.applicationType`, { required: "Type is required" })}
//                           className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                         >
//                           <option value="">Select type</option>
//                           <option value="Newborn Child">Newborn Child</option>
//                           <option value="Passport Renewal">Passport Renewal</option>
//                           <option value="Lost Passport">Lost Passport</option>
//                           <option value="Damaged Passport">Damaged Passport</option>
//                           <option value="Travel Document">Travel Document</option>
//                           <option value="Birth Registration">Birth Registration</option>
//                         </select>
//                         {errors.additionalClients?.[index]?.applicationType && (
//                           <p className="mt-1 text-sm text-red-600">{errors.additionalClients[index].applicationType.message}</p>
//                         )}
//                       </div>
//                       <Button type="button" variant="outline" onClick={() => remove(index)}>
//                         Remove
//                       </Button>
//                     </div>
//                   ))}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => append({ name: "", applicationType: "" })}
//                   >
//                     Add More
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Payment Details</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register("amount", { valueAsNumber: true })}
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Paid Amount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register("paidAmount", { valueAsNumber: true })}
//                   className="mt-1"
//                   onChange={(e) => setValue("paidAmount", parseFloat(e.target.value) || 0)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Discount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register("discount", { valueAsNumber: true })}
//                   className="mt-1"
//                   onChange={(e) => setValue("discount", parseFloat(e.target.value) || 0)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Due Amount (¥)</label>
//                 <Input value={dueAmount.toString()} className="mt-1 bg-gray-50" disabled />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Payment Status</label>
//                 <select
//                   {...register("paymentStatus")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="Due">Due</option>
//                   <option value="Partial">Partial</option>
//                   <option value="Paid">Paid</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Payment Method <span className="text-gray-500 text-xs">(Optional)</span>
//                 </label>
//                 <select
//                   {...register("paymentMethod")}
//                   className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//                 >
//                   <option value="">Select payment method</option>
//                   <option value="Bank Furicomy">Bank Furikomi</option>
//                   <option value="Counter Cash">Counter Cash</option>
//                   <option value="Credit Card">Credit Card</option>
//                   <option value="Paypay">PayPay</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Remarks</h3>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Remarks</label>
//               <textarea
//                 {...register("remarks")}
//                 className="flex h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-6">
//             <Button variant="secondary" onClick={onClose}>Cancel</Button>
//             <Button type="submit">Create Application</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



// const bcrypt = require('bcryptjs');
// const AdminModel = require('../models/newModel/adminModel');

// // Create new admin
// exports.createAdmin = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; 
//     const { name, email, password, role, status } = req.body;

//     const existingAdmin = await AdminModel.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const admin = new AdminModel({
//       superAdminId, 
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       status,
//       permissions: [],
//     });

//     await admin.save();

//     const { password: _, ...adminWithoutPassword } = admin.toObject(); // Remove password
//     res.status(201).json({ success: true, message: 'Admin created successfully', admin: adminWithoutPassword });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error creating admin', error: error.message });
//   }
// };

// // Get all admins
// exports.getAdmins = async (req, res) => {
//   const { _id, role, superAdminId } = req.user;

//   if (!role || (role !== 'superadmin' && role !== 'admin')) {
//     return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
//   }

//   try {
//     let query = {};

//     if (role === 'superadmin') {
//       query = { superAdminId: _id };
//     } else if (role === 'admin') {
//       query = { $or: [{ createdBy: _id }, { superAdminId }] };
//     }

//     const admins = await AdminModel.find(query).select('-password');

//     return res.status(200).json({ success: true, admins });
//   } catch (error) {
//     console.error('Error fetching admins:', error.message);
//     return res.status(500).json({ success: false, message: 'Internal Server Error', error });
//   }
// };

// // Get admin by ID
// exports.getAdminById = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; 
//     const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId }).select('-password');

//     if (!admin) {
//       return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
//     }
    
//     res.status(200).json({ success: true, admin });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching admin', error: error.message });
//   }
// };

// // Update admin
// exports.updateAdmin = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;
//     const { name, email, role, status } = req.body;

//     const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId }).select('-password');
//     if (!admin) {
//       return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
//     }

//     admin.name = name || admin.name;
//     admin.email = email || admin.email;
//     admin.role = role || admin.role;
//     admin.status = status || admin.status;

//     await admin.save();
//     res.status(200).json({ success: true, message: 'Admin updated successfully', admin });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating admin', error: error.message });
//   }
// };

// // Delete admin
// exports.deleteAdmin = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; 

//     const admin = await AdminModel.findOneAndDelete({ _id: req.params.id, superAdminId });
//     if (!admin) {
//       return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
//     }
//     res.status(200).json({ success: true, message: 'Admin deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error deleting admin', error: error.message });
//   }
// };





// const mongoose = require("mongoose");

// const adminSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       default: "admin",
//     },
//     status: {
//       type: String,
//       default: "active",
//     },
//     lastLogin: {
//       type: Date,
//       default: null,
//     },
//     superAdminId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "SuperAdmin",
//     },

//     superAdminPhoto: {
//       type: String,
//       default: "",
//     },

//     permissions: {
//       type: Array,
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// const AdminModel = mongoose.model("AdminModel", adminSchema);

// module.exports = AdminModel;


// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const { createServer } = require('http');
// const redis = require('redis');
// const dbConnection = require('./config/dbConn');  // Assuming you have your DB connection set up
// const logMiddleware = require('./middleware/newMiddleware/auditLogMiddleware');

// // Import Routes
// const authRoute = require('./routes/authRoute');
// const clientRoute = require('./routes/newRoutes/clientRoute');
// const visaApplicationRoute = require('./routes/newRoutes/applicationRoute');
// const japanVisitRoute = require('./routes/newRoutes/japanVisitRoute');
// const documentTranslationRoute = require('./routes/newRoutes/documentTranslationRoute');
// const ePassportRoute = require('./routes/newRoutes/ePassportRoute');
// const otherServicesRoute = require('./routes/newRoutes/otherServicesRoute');
// const graphicDesignRoute = require('./routes/newRoutes/graphicDesingRoute');
// const appointmentRoute = require('./routes/newRoutes/appointmentRoute');
// const adminRoute = require('./routes/newRoutes/adminRoute');
// const superAdminRoute = require('./routes/newRoutes/superAdminRoute');
// const serviceRequestRoute = require('./routes/newRoutes/serviceRequestRoute');
// const globalSearchRoute = require('./routes/newRoutes/globalSearchRoute');
// const noteRoute = require('./routes/newRoutes/noteRoute');
// const backupDataRoute = require('./routes/newRoutes/backupDataRoute');
// const auditLogRoute = require('./routes/newRoutes/auditLogRoute');
// const callLogsRoute = require('./routes/newRoutes/callLogsRoute');
// const campaignRoute = require('./routes/newRoutes/campaignRoute');
// const appBannerRoute = require ('./routes/newRoutes/appBannerRoute');
// const { initRedisClient } = require('./config/redisClient');

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();
// const server = createServer(app);

// // Middleware for parsing JSON and URL-encoded data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // CORS Middleware
// app.use(
//   cors({
//     origin: ['https://crm.zoomcreatives.jp', 'http://localhost:5173'], // Allow specific origins
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
//     credentials: true, // Allow credentials (cookies, authentication headers)
//   })
// );

// // Custom middleware for logging
// app.use(logMiddleware);

// // Database Connection
// dbConnection();

// // Initialize Redis client

// // initRedisClient();


// // Routes
// app.use('/api/v1/auth', authRoute);
// app.use('/api/v1/client', clientRoute);
// app.use('/api/v1/visaApplication', visaApplicationRoute);
// app.use('/api/v1/japanVisit', japanVisitRoute);
// app.use('/api/v1/documentTranslation', documentTranslationRoute);
// app.use('/api/v1/ePassport', ePassportRoute);
// app.use('/api/v1/otherServices', otherServicesRoute);
// app.use('/api/v1/graphicDesign', graphicDesignRoute);
// app.use('/api/v1/appointment', appointmentRoute);
// app.use('/api/v1/admin', adminRoute);
// app.use('/api/v1/superAdmin', superAdminRoute);
// app.use('/api/v1/serviceRequest', serviceRequestRoute);
// app.use('/api/v1/globalSearch', globalSearchRoute);
// app.use('/api/v1/note', noteRoute);
// app.use('/api/v1/backup', backupDataRoute);
// app.use('/api/v1/logs', auditLogRoute);
// app.use('/api/v1/callLogs', callLogsRoute);
// app.use('/api/v1/campaign', campaignRoute);
// app.use('/api/v1/appBanner', appBannerRoute);

// // Default Route
// app.get('/', (req, res) => {
//   res.json({ success: true, message: 'Welcome to the Zoom Creatives Server!' });
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port: ${PORT}`);
// });




// // i want to add a new features like superadmin is main and in superadmin admin superadmin is parent and admn is child for superadmin so i want to when epassport created then send the notfication some one assign you a task with task name for example thre is ram super admin and ram created admin login sunil anil and create a epassport but select choose a handledBy logins then logins got notfiy anil assgin you a epassport task with notfication sound 
// // feel free to mofied the code and give me full working bugs errror free code and fuly optomzed and improved and refacotor code 