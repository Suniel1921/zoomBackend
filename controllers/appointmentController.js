const { default: mongoose } = require("mongoose");
const applicationModel = require("../models/newModel/applicationModel");
const AppointmentModel = require("../models/newModel/appointmentModel");
const ClientModel = require("../models/newModel/clientModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");
const applicationStepModel = require("../models/newModel/steps/applicationStepModel");
const japanVisitApplicationModel = require("../models/newModel/japanVisitModel");




// // Create an appointment
// exports.createAppointment = async (req, res) => {
//     try {
//       const appointment = new AppointmentModel(req.body);
//       await appointment.save();
//       res.status(201).json({success: true, message: 'Appointment created successfully',appointment});
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({success: false, message: 'Failed to create appointment',error});
//     }
//   };

  

//   // Get all appointments
// exports.getAllAppointments = async (req, res) => {
//     try {
//       const appointments = await AppointmentModel.find().populate('clientId', 'name phone');
//       res.status(200).json({success: true, appointments});
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({success: false, message: 'Failed to retrieve appointments',error});
//     }
//   };

  


//   // Get an appointment by ID
// exports.getAppointmentById = async (req, res) => {
//     try {
//       const appointment = await AppointmentModel.findById(req.params.id);
//       if (!appointment) {
//         return res.status(404).json({success: false, message: 'Appointment not found'});
//       }
//       res.status(200).json({success: true, message: 'appointment fetched succssfully', appointment});
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({success: false, message: 'Failed to retrieve appointment', error});
//     }
//   };





// exports.updateAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { mode, ...updateData } = req.body;

//     // Ensure the mode is valid (edit or reschedule)
//     if (!['edit', 'reschedule'].includes(mode)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid mode. Mode must be either "edit" or "reschedule".',
//       });
//     }

//     // Restrict fields for "reschedule" mode
//     if (mode === 'reschedule') {
//       const { date, time, notes } = updateData;
//       if (!date || !time) {
//         return res.status(400).json({
//           success: false,
//           message: 'Date and Time are required for rescheduling.',
//         });
//       }
//       updateData.date = new Date(date); // Ensure proper date formatting
//       updateData.time = time;
//       if (notes) updateData.notes = notes; // Include notes if provided
//     }

//     const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true } // Return the updated document
//     );

//     if (!updatedAppointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Appointment not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Appointment ${mode}d successfully`,
//       updatedAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update appointment',
//       error,
//     });
//   }
// };






//   // Update appointment status (mark as completed or cancelled)
// exports.updateAppointmentStatus = async (req, res) => {
//     const { status } = req.body;  // Status can be "Completed" or "Cancelled"
//     const { id } = req.params;
  
//     try {
//       // Find the appointment by ID
//       const appointment = await AppointmentModel.findById(id);
      
//       if (!appointment) {
//         return res.status(404).json({ success: false, message: 'Appointment not found' });
//       }
  
//       // Check if the status is valid (Completed or Cancelled)
//       if (status !== 'Completed' && status !== 'Cancelled') {
//         return res.status(400).json({ success: false, message: 'Invalid status' });
//       }
  
//       // Update the appointment status
//       appointment.status = status;
  
//       // Optionally, add timestamps for when the appointment is completed or cancelled
//       if (status === 'Completed') {
//         appointment.completedAt = new Date();
//       } else if (status === 'Cancelled') {
//         appointment.cancelledAt = new Date();
//       }
  
//       // Save the updated appointment
//       await appointment.save();
  
//       res.status(200).json({
//         success: true,
//         message: 'Appointment status updated successfully',
//         appointment
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Failed to update appointment status', error });
//     }
//   };
  

//   // Delete an appointment by ID
// exports.deleteAppointment = async (req, res) => {
//     try {
//       const deletedAppointment = await AppointmentModel.findByIdAndDelete(req.params.id);
//       if (!deletedAppointment) {
//         return res.status(404).json({success: false, message: 'Appointment not found'});
//       }
//       res.status(200).json({success: true, message: 'Appointment deleted successfully'});
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({success: false, message: 'Failed to delete appointment', error});
//     }
//   };









// Create an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
    const { clientId, ...appointmentData } = req.body;

    // Validate if the client exists and belongs to the superAdmin
    // const client = await AppointmentModel.findOne({ _id: clientId, superAdminId });
    // if (!client) {
    //   return res.status(400).json({ success: false, message: 'Client not found or unauthorized' });
    // }

    const appointment = new AppointmentModel({
      clientId,
      ...appointmentData,
      superAdminId, // Attach superAdminId
    });
    await appointment.save();

    res.status(201).json({ success: true, message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error });
  }
};

// Get all appointments for the authenticated superAdmin
exports.getAllAppointments = async (req, res) => {
  try {
    // const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
    // const appointments = await AppointmentModel.find({ superAdminId })
    const appointments = await AppointmentModel.find()
      .populate('clientId', 'name phone')  // Populate client information
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'appointment fetched sucessfully', appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments', error });
  }
};

// Get an appointment by ID for the authenticated superAdmin
exports.getAppointmentsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params; // Extract clientId from request parameters

    // Find all appointments with the given clientId
    const appointments = await AppointmentModel.find({ clientId });

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointments found for the given clientId' });
    }

    res.status(200).json({ success: true, message: 'Appointments fetched successfully', appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments', error: error.message });
  }
};



// Update an appointment by ID for the authenticated superAdmin
// exports.updateAppointment = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user;   // Extract superAdminId from the authenticated user
//     const { id } = req.params;
//     const { mode, ...updateData } = req.body;

//     // Ensure the mode is valid (edit or reschedule)
//     if (!['edit', 'reschedule'].includes(mode)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid mode. Mode must be either "edit" or "reschedule".',
//       });
//     }

//     // Restrict fields for "reschedule" mode
//     if (mode === 'reschedule') {
//       const { date, time, notes } = updateData;
//       if (!date || !time) {
//         return res.status(400).json({
//           success: false,
//           message: 'Date and Time are required for rescheduling.',
//         });
//       }
//       updateData.date = new Date(date); // Ensure proper date formatting
//       updateData.time = time;
//       if (notes) updateData.notes = notes; // Include notes if provided
//     }

//     // Check if the appointment belongs to the authenticated superAdmin
//     const updatedAppointment = await AppointmentModel.findOneAndUpdate(
//       { _id: id, superAdminId },
//       updateData,
//       { new: true } // Return the updated document
//     );

//     if (!updatedAppointment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Appointment not found or unauthorized',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Appointment ${mode}d successfully`,
//       updatedAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update appointment',
//       error,
//     });
//   }
// };


// **********when we use above code to update the data then got error unauthorized login first (check route also (::add requiredLogin middleware)) (::fixed later)***********



exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode, ...updateData } = req.body;

    // Ensure the mode is valid (edit or reschedule)
    if (!['edit', 'reschedule'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Mode must be either "edit" or "reschedule".',
      });
    }

    // Restrict fields for "reschedule" mode
    if (mode === 'reschedule') {
      const { date, time, notes } = updateData;
      if (!date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Date and Time are required for rescheduling.',
        });
      }
      updateData.date = new Date(date); // Ensure proper date formatting
      updateData.time = time;
      if (notes) updateData.notes = notes; // Include notes if provided
    }

    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${mode}d successfully`,
      updatedAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error,
    });
  }
};





// Update appointment status (mark as completed or cancelled) for the authenticated superAdmin
exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;  // Status can be "Completed" or "Cancelled"
  const { id } = req.params;


  try {
    const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
    const appointment = await AppointmentModel.findOne({ _id: id, superAdminId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    if (status !== 'Completed' && status !== 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    appointment.status = status;

    if (status === 'Completed') {
      appointment.completedAt = new Date();
    } else if (status === 'Cancelled') {
      appointment.cancelledAt = new Date();
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update appointment status', error });
  }
};



// Delete an appointment by ID for the authenticated superAdmin
exports.deleteAppointment = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
    const { id } = req.params;

    const deletedAppointment = await AppointmentModel.findOneAndDelete({ _id: id, superAdminId });

    if (!deletedAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete appointment', error });
  }
};




















  





  // *****************************************************GET ALL MODEL DATA AT ONCE FOR ACCOUNT AND TASK (FRONTEND)**************************************************

  // exports.fetchAllModelData = async (req, res) => {
  //   try {
  //     // Fetch data from all models in parallel
  //     const [application, japanVisit, documentTranslation, epassports, otherServices, graphicDesigns, appointment, ] = await Promise.all([
  //       applicationModel.find().populate('clientId').populate('step').lean(),
  //       japanVisitAppplicaitonModel.find().populate('clientId').lean(),
  //       documentTranslationModel.find().populate('clientId').lean(),
  //       ePassportModel.find().populate('clientId').lean(),
  //       OtherServiceModel.find().populate('clientId').lean(),
  //       GraphicDesignModel.find().populate('clientId').lean(),
  //       AppointmentModel.find().populate('clientId').lean(),

  //     ]);
  
  //     // Combine the data into a single response object
  //     const allData = {application, japanVisit, documentTranslation, epassports, otherServices, graphicDesigns, appointment,};

  //     // Send the combined data as a JSON response
  //     res.status(200).json({success: true, message: 'all model data fetched successfully', allData});
  //   } catch (error) {
  //     console.error('Error fetching all data:', error);
  //     res.status(500).json({success: false, meessage: 'Failed to fetch data from models', error });
  //   }
  // };


  exports.fetchAllModelData = async (req, res) => {
    try {
      const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
  
      // Fetch data from all models in parallel, filtering by superAdminId
      const [application, japanVisit, documentTranslation, epassports, otherServices, graphicDesigns, appointment] = await Promise.all([
        applicationModel.find({ superAdminId }).populate('clientId').lean(),
        japanVisitApplicationModel.find({ superAdminId }).populate('clientId').lean(),
        documentTranslationModel.find({ superAdminId }).populate('clientId').lean(),
        ePassportModel.find({ superAdminId }).populate('clientId').lean(),
        OtherServiceModel.find({ superAdminId }).populate('clientId').lean(),
        GraphicDesignModel.find({ superAdminId }).populate('clientId').lean(),
        AppointmentModel.find({ superAdminId }).populate('clientId').lean(),
      ]);
  
      // Combine the data into a single response object
      const allData = {
        application,
        japanVisit,
        documentTranslation,
        epassports,
        otherServices,
        graphicDesigns,
        appointment,
      };
  
      // Send the combined data as a JSON response
      res.status(200).json({success: true, message: 'All model data fetched successfully',allData,});
    } catch (error) {
      console.error('Error fetching all data:', error);
      res.status(500).json({success: false, message: 'Failed to fetch data from models',error,});
    }
  };
  





  //get all model data by id
  // Define the models array
  const models = [
    applicationModel,
    japanVisitApplicationModel,
    documentTranslationModel,
    ePassportModel,
    OtherServiceModel,
    GraphicDesignModel,
    AppointmentModel
  ];
  
  exports.getAllModelDataById = async (req, res) => {
    try {
      // Extract clientId from the route params
      const { id } = req.params;
  
      // Ensure clientId is provided and is a valid ObjectId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing client ID' });
      }
  
      // Use a map to store results for each model
      const allData = {};
  
      // Run queries in parallel
      const promises = models.map(model =>
        model.find({ clientId: id }) // Querying based on clientId instead of id
          .populate('clientId')        // Populate clientId field
          // .populate('step')            // Populate step field
          .lean()
          .catch(err => {
            return { success: false, message: `Failed to fetch data for model ${model.modelName}`, error: err.message };
          })
      );
  
      const results = await Promise.all(promises);
  
      // Store results by model name
      results.forEach((data, idx) => {
        allData[models[idx].modelName] = data; 
      });
  
      // console.log('Fetched Data:', allData); // Log the fetched data for debugging
  
      // If there's data to return, send the response
      if (Object.keys(allData).length > 0) {
        return res.status(200).json({ success: true, message: 'Data fetched successfully', allData });
      } else {
        return res.status(404).json({ success: false, message: 'No data found for the client ID' });
      }
  
    } catch (error) {
      // Log any unexpected errors
      console.error('Unexpected error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch data by client ID', error: error.message });
    }
  };
  




// Controller to handle creating a new application step with an object structure for stepNames
exports.createApplicationStep = async (req, res) => {
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
    const newStep = new applicationStepModel({
      clientId,  // Make sure clientId is saved at the top level
      stepNames,
    });

    // Save the step to the database
    const savedStep = await newStep.save();

    // Return the saved step as a response
    res.status(201).json(savedStep);
  } catch (error) {
    console.error('Error while creating application step:', error.message); // Log error message
    console.error('Full error:', error); // Log full error stack
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message || error, // Send specific error message
    });
  }
};



// Controller to handle fetching the application steps based on clientId
exports.getApplicationSteps = async (req, res) => {
  try {
    // const { clientId } = req.params;  // Get clientId from the request parameters

    // // Validate clientId
    // if (!clientId) {
    //   return res.status(400).json({ success: false, message: 'clientId is required' });
    // }

    // Fetch the ApplicationStep document based on the clientId
    const applicationStep = await applicationStepModel.findOne();

    // Check if the application step exists
    if (!applicationStep) {
      return res.status(404).json({ success: false, message: 'Application steps not found for this client' });
    }

    // Return the fetched application step
    res.status(200).json({ success: true, message: 'appliction step retrived success', applicationStep });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};





// Controller to handle updating the status of a specific step
// exports.updateStepStatus = async (req, res) => {
//   try {
//     const { step, status } = req.body;
//     const clientId = req.params.id;

//     if (!step || !status) {
//       return res.status(400).json({ success: false, message: 'Step or status missing.' });
//     }

//     const updated = await applicationStepModel.findOneAndUpdate(
//       { 'clientId': clientId },
//       { [`stepNames.${step}.status`]: status },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Client or step not found.' });
//     }

//     res.status(200).json({ success: true, data: updated });
//   } catch (error) {
//     console.error('Error updating status:', error);
//     res.status(500).json({ success: false, message: 'Server error.' });
//   }
// };






// Controller to handle updating the status of a specific step

// exports.updateStepStatus = async (req, res) => {
//   try {
//     const { step, status } = req.body;
//     const clientId = req.params.id;

//     if (!step || !status) {
//       return res.status(400).json({ success: false, message: 'Step or status missing.' });
//     }

//     // Ensure the correct clientId is passed when updating the step status
//     const updated = await ClientModel.findOneAndUpdate(
//       { clientId: clientId },  // Make sure you're matching the clientId
//       { [`stepNames.${step}.status`]: status }, // Update status of the specified step
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Client or step not found.' });
//     }

//     res.status(200).json({ success: true, data: updated });
//   } catch (error) {
//     console.error('Error updating status:', error);
//     res.status(500).json({ success: false, message: 'Server error.' });
//   }
// };





// ******************************here upadating the status based on model (using single api route)******************************


// Model Mapping (make sure this is aligned with your frontend)
const modelMapping = {
  application: applicationModel,
  appointment: AppointmentModel,
  documenttranslation: documentTranslationModel,
  epassports: ePassportModel,
  graphicDesign: GraphicDesignModel,
  japanvisit: japanVisitApplicationModel, 
  otherservices: OtherServiceModel,
};

// Route to update step status
exports.updateStepStatus = async (req, res) => {
  const { clientId, steps } = req.body;

  try {
    // Loop through each step and update it
    for (let step of steps) {
      const { stepId, status, modelName } = step;

      // Log the incoming modelName to ensure correct casing
      // console.log('Incoming Model Name:', modelName); // Log incoming model name

      // Map modelName to lowercase and check
      const Model = modelMapping[modelName.toLowerCase()];
      if (!Model) {
        return res.status(400).json({ success: false, message: `Invalid model name: ${modelName}` });
      }

      // console.log('Model:', Model); // Log selected model from mapping
      // console.log('Step ID:', stepId);
      // console.log('Status:', status);

      const result = await Model.updateOne(
        { "steps._id": stepId },
        { $set: { "steps.$.status": status } }
      );

      if (result.nModified === 0) {
        console.log(`No document updated for stepId ${stepId}`);
      }
    }

    return res.status(200).json({ success: true, message: "Statuses updated successfully!" });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: "Failed to update statuses", error: error.message });
  }
};













// **********************global search**************************
// Global search endpoint with optional pagination and optimized search


// exports.globalSearch = async (req, res) => {
//   const { query } = req.query; // Use req.query for GET requests

//   if (!query || query.trim() === '') {
//     return res.status(400).json({ error: 'Search query is required' });
//   }

//   try {
//     const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching

//     // Search in ClientModel
//     const clients = await ClientModel.find({
//       $or: [
//         { name: regex },
//         { email: regex },
//         { phone: regex },
//       ],
//     });

//     // Search in applicationModel
//     const applications = await applicationModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredApplications = applications.filter(app => app.clientId !== null);

//     // Search in documentTranslationModel
//     const documentTranslations = await documentTranslationModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredDocumentTranslations = documentTranslations.filter(dt => dt.clientId !== null);

//     // Search in ePassportModel
//     const ePassports = await ePassportModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredEPassports = ePassports.filter(ep => ep.clientId !== null);

//     // Search in GraphicDesignModel
//     const graphicDesigns = await GraphicDesignModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredGraphicDesigns = graphicDesigns.filter(gd => gd.clientId !== null);

//     // Search in japanVisitApplicationModel
//     const japanVisits = await japanVisitApplicationModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredJapanVisits = japanVisits.filter(jv => jv.clientId !== null);

//     // Search in OtherServiceModel
//     const otherServices = await OtherServiceModel.find()
//       .populate({
//         path: 'clientId',
//         match: { name: regex },
//         select: 'name email phone',
//       })
//       .exec();
//     const filteredOtherServices = otherServices.filter(os => os.clientId !== null);

//     res.status(200).json({
//       clients,
//       applications: filteredApplications,
//       documentTranslations: filteredDocumentTranslations,
//       ePassports: filteredEPassports,
//       graphicDesigns: filteredGraphicDesigns,
//       japanVisits: filteredJapanVisits,
//       otherServices: filteredOtherServices,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };













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
