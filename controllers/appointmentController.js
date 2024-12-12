const { default: mongoose } = require("mongoose");
const applicationModel = require("../models/newModel/applicationModel");
const AppointmentModel = require("../models/newModel/appointmentModel");
const ClientModel = require("../models/newModel/clientModel");
const documentTranslationModel = require("../models/newModel/documentTranslationModel");
const ePassportModel = require("../models/newModel/ePassportModel");
const GraphicDesignModel = require("../models/newModel/graphicDesingModel");
const japanVisitAppplicaitonModel = require("../models/newModel/japanVisitModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");
const applicationStepModel = require("../models/newModel/steps/applicationStepModel");

// Create an appointment
exports.createAppointment = async (req, res) => {
    try {
      const appointment = new AppointmentModel(req.body);
      await appointment.save();
      res.status(201).json({success: true, message: 'Appointment created successfully',appointment});
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Failed to create appointment',error});
    }
  };

  

  // Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
      const appointments = await AppointmentModel.find().populate('clientId', 'name phone');
      res.status(200).json({success: true, appointments});
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Failed to retrieve appointments',error});
    }
  };

  


  // Get an appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({success: false, message: 'Appointment not found'});
      }
      res.status(200).json({success: true, message: 'appointment fetched succssfully', appointment});
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Failed to retrieve appointment', error});
    }
  };

  

  // Update an appointment by ID
exports.updateAppointment = async (req, res) => {
    try {
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      res.status(200).json({success: true, message: 'Appointment updated successfully',updatedAppointment});
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Failed to update appointment', error});
    }
  };





  // Update appointment status (mark as completed or cancelled)
exports.updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;  // Status can be "Completed" or "Cancelled"
    const { id } = req.params;
  
    try {
      // Find the appointment by ID
      const appointment = await AppointmentModel.findById(id);
      
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
  
      // Check if the status is valid (Completed or Cancelled)
      if (status !== 'Completed' && status !== 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
  
      // Update the appointment status
      appointment.status = status;
  
      // Optionally, add timestamps for when the appointment is completed or cancelled
      if (status === 'Completed') {
        appointment.completedAt = new Date();
      } else if (status === 'Cancelled') {
        appointment.cancelledAt = new Date();
      }
  
      // Save the updated appointment
      await appointment.save();
  
      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        appointment
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update appointment status', error });
    }
  };
  



  



  // Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
    try {
      const deletedAppointment = await AppointmentModel.findByIdAndDelete(req.params.id);
      if (!deletedAppointment) {
        return res.status(404).json({success: false, message: 'Appointment not found'});
      }
      res.status(200).json({success: true, message: 'Appointment deleted successfully'});
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, message: 'Failed to delete appointment', error});
    }
  };
  



  // *****************************************************GET ALL MODEL DATA AT ONCE FOR ACCOUNT AND TASK (FRONTEND)**************************************************

  exports.fetchAllModelData = async (req, res) => {
    try {
      // Fetch data from all models in parallel
      const [application, japanVisit, documentTranslation, epassports, otherServices, graphicDesigns, appointment, ] = await Promise.all([
        applicationModel.find().populate('clientId').populate('step').lean(),
        japanVisitAppplicaitonModel.find().populate('clientId').populate('step').lean(),
        documentTranslationModel.find().populate('clientId').populate('step').lean(),
        ePassportModel.find().populate('clientId').populate('step').lean(),
        OtherServiceModel.find().populate('clientId').populate('step').lean(),
        GraphicDesignModel.find().populate('clientId').populate('step').lean(),
        AppointmentModel.find().populate('clientId').populate('step').lean(),

      ]);
  
      // Combine the data into a single response object
      const allData = {application, japanVisit, documentTranslation, epassports, otherServices, graphicDesigns, appointment,};

      // Send the combined data as a JSON response
      res.status(200).json({success: true, message: 'all model data fetched successfully', allData});
    } catch (error) {
      console.error('Error fetching all data:', error);
      res.status(500).json({success: false, meessage: 'Failed to fetch data from models', error });
    }
  };


  //get all model data by id
  // Define the models array
  const models = [
    applicationModel,
    japanVisitAppplicaitonModel,
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
          .populate('step')            // Populate step field
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





// here upadating the status based on applicationstepmodel and above code based on stepmodel (just for testing purpose (both code work ))

exports.updateStepStatus = async (req, res) => {
  try {
    const { clientId, stepId, status } = req.body;  // Expecting clientId, stepId, and status

    if (!clientId || !stepId || !status) {
      return res.status(400).json({
        success: false,
        message: "Client ID, Step ID, and Status are required"
      });
    }

    // Find the step using the clientId and stepId
    const applicationStep = await applicationStepModel.findOne({ clientId });

    if (!applicationStep) {
      return res.status(404).json({
        success: false,
        message: "Application step not found"
      });
    }

    // Update the step's status by finding the correct step
    const stepToUpdate = applicationStep.stepNames.get(stepId);

    if (!stepToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Step not found"
      });
    }

    // Update the step status
    stepToUpdate.status = status;

    // Save the updated document
    await applicationStep.save();

    res.status(200).json({
      success: true,
      message: "Step status updated successfully",
      data: applicationStep
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
