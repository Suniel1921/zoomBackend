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



//****************sending email while appointment create ****************

const nodemailer = require('nodemailer');
const moment = require('moment');  
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL, 
    pass: process.env.PASSWORD 
  }
});

exports.createAppointment = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;  
    const { clientId, ...appointmentData } = req.body;

    // Validate if the client exists and belongs to the superAdmin
    const client = await ClientModel.findOne({ _id: clientId, superAdminId });
    if (!client) {
      return res.status(400).json({ success: false, message: 'Client not found or unauthorized' });
    }

    const appointment = new AppointmentModel({
      clientId,
      ...appointmentData,
      superAdminId, 
    });
    await appointment.save();

    // Get the client's email address
    const clientEmail = client.email;

    // Format the appointment date and time
    const formattedDate = moment(appointmentData.date).format('MMMM Do YYYY, h:mm A');
    const formattedTime = appointmentData.time ? moment(appointmentData.time, 'HH:mm').format('h:mm A') : 'Not specified';
    const meetingType = appointmentData.meetingType.charAt(0).toUpperCase() + appointmentData.meetingType.slice(1); // Capitalize meeting type

    // Prepare email content
    const emailContent = `
      Hello ${client.name},

      Your appointment has been Schedule with the following details:

      - Date & Time: ${formattedDate} at ${formattedTime}
      - Meeting Type: ${meetingType}
      - Duration: ${appointmentData.duration} minutes
      - Location: ${appointmentData.location || 'Not provided'}
      
      Thank you for using our service!

      Best regards,
      Zoom Cretives Team
    `;

    // Send an email notification to the client
    const mailOptions = {
      from: process.env.MYEMAIL,
      to: clientEmail,  // Use the client's email
      subject: 'Appointment Created Successfully',
      text: emailContent
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ success: true, message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error });
  }
};








// Get all appointments for the authenticated superAdmin
exports.getAllAppointments = async (req, res) => {
  try {
    // const { _id: superAdminId } = req.user;  
    // const appointments = await AppointmentModel.find({ superAdminId })
    const appointments = await AppointmentModel.find()
      .populate('clientId', 'name phone')  
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
    let isRescheduled = false;
    if (mode === 'reschedule') {
      const { date, time, notes } = updateData;
      if (!date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Date and Time are required for rescheduling.',
        });
      }
      updateData.date = new Date(date); 
      updateData.time = time;
      if (notes) updateData.notes = notes; 
      isRescheduled = true; 
    }

    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } 
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // If the appointment was rescheduled, send an email
    if (isRescheduled) {
      const client = await ClientModel.findById(updatedAppointment.clientId);
      const clientEmail = client.email;

      // Format the appointment date and time for email
      const formattedDate = moment(updatedAppointment.date).format('MMMM Do YYYY, h:mm A');
      const formattedTime = updatedAppointment.time ? moment(updatedAppointment.time, 'HH:mm').format('h:mm A') : 'Not specified';

      // Prepare email content for rescheduling
      const emailContent = `
        Hello ${client.name},

        Your appointment has been rescheduled with the following new details:

        - New Date & Time: ${formattedDate} at ${formattedTime}
        - Status: Rescheduled
        - Duration: ${updatedAppointment.duration} minutes
        - Location: ${updatedAppointment.location || 'Not provided'}
        - Notes: ${updatedAppointment.notes || 'No additional notes'}
        
        We apologize for any inconvenience this may have caused, and we appreciate your understanding.

        Thank you for using our service!

        Best regards,
        Zoom Creatives Team
      `;

      // Send an email notification to the client
      const mailOptions = {
        from: process.env.MYEMAIL,
        to: clientEmail,  // Use the client's email
        subject: 'Appointment Rescheduled',
        text: emailContent
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          // console.log('Email sent:', info.response);
        }
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

exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;  // Status can be "Completed", "Cancelled", or "Rescheduled"
  const { id } = req.params;

  try {
    const { _id: superAdminId } = req.user;  // Extract superAdminId from the authenticated user
    const appointment = await AppointmentModel.findOne({ _id: id, superAdminId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    if (status !== 'Completed' && status !== 'Cancelled' && status !== 'Rescheduled') {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Set status and timestamps
    appointment.status = status;
    if (status === 'Completed') {
      appointment.completedAt = new Date();
    } else if (status === 'Cancelled') {
      appointment.cancelledAt = new Date();
    } else if (status === 'Rescheduled') {
      const { date, time } = req.body;
      appointment.date = new Date(date);
      appointment.time = time;
      appointment.rescheduledAt = new Date();
    }

    await appointment.save();

    // Get the client's email address
    const client = await ClientModel.findById(appointment.clientId);
    const clientEmail = client.email;

    // Format the appointment date and time for email
    const formattedDate = moment(appointment.date).format('MMMM Do YYYY, h:mm A');
    const formattedTime = appointment.time ? moment(appointment.time, 'HH:mm').format('h:mm A') : 'Not specified';

    // Prepare email content based on the appointment status
    let emailContent = '';
    if (status === 'Completed') {
      emailContent = `
        Hello ${client.name},

        Your appointment has been completed successfully with the following details:

        - Date & Time: ${formattedDate} at ${formattedTime}
        - Status: Completed
        - Duration: ${appointment.duration} minutes
        - Location: ${appointment.location || 'Not provided'}
        
        Thank you for using our service!

        Best regards,
        Zoom Creatives Team
      `;
    } else if (status === 'Cancelled') {
      emailContent = `
        Hello ${client.name},

        We regret to inform you that your appointment has been cancelled. The details are as follows:

        - Date & Time: ${formattedDate} at ${formattedTime}
        - Status: Cancelled
        - Duration: ${appointment.duration} minutes
        - Location: ${appointment.location || 'Not provided'}
        
        If you wish to reschedule, please contact us.

        Best regards,
        Zoom Creatives Team
      `;
    } else if (status === 'Rescheduled') {
      emailContent = `
        Hello ${client.name},

        Your appointment has been rescheduled with the following new details:

        - New Date & Time: ${formattedDate} at ${formattedTime}
        - Status: Rescheduled
        - Duration: ${appointment.duration} minutes
        - Location: ${appointment.location || 'Not provided'}
        
        Thank you for your understanding.

        Best regards,
        Zoom Creatives Team
      `;
    }

    // Send an email notification to the client
    const mailOptions = {
      from: process.env.MYEMAIL,
      to: clientEmail,  // Use the client's email
      subject: `Appointment ${status} Notification`,
      text: emailContent
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({
      success: true,
      message: `Appointment ${status}d successfully`,
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error,
    });
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







  // ****************************GET ALL MODEL DATA AT ONCE FOR ACCOUNT AND TASK (FRONTEND) (optimzed later migrate this code in another controller(create new controller route))**************************************************
 
  exports.fetchAllModelData = async (req, res) => {
    try {
      const { superAdminId, _id, role } = req.user; 
  
      // Role-based check: Only 'superadmin' or 'admin' are allowed
      if (role !== "superadmin" && role !== "admin") {
        console.log("Unauthorized access attempt:", req.user);
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Access denied.",
        });
      }
  
      // Define query based on role
      let query = {};
      if (role === "superadmin") {
        query = { superAdminId: _id };
      } else if (role === "admin") {
        query = { $or: [{ createdBy: _id }, { superAdminId }] };
      }
  
      // Fetch data from models in parallel
      const [
        application,
        japanVisit,
        documentTranslation,
        epassports,
        otherServices,
        graphicDesigns,
        appointment,
      ] = await Promise.allSettled([
        applicationModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        japanVisitApplicationModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        documentTranslationModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        ePassportModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        OtherServiceModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        GraphicDesignModel.find(query).populate("clientId").populate("createdBy", "name email").lean(),
        AppointmentModel.find(query).populate("clientId").lean(),
      ]);
  
      // Process results from `Promise.allSettled()`
      const allData = {
        application: application.status === "fulfilled" ? application.value : [],
        japanVisit: japanVisit.status === "fulfilled" ? japanVisit.value : [],
        documentTranslation: documentTranslation.status === "fulfilled" ? documentTranslation.value : [],
        epassports: epassports.status === "fulfilled" ? epassports.value : [],
        otherServices: otherServices.status === "fulfilled" ? otherServices.value : [],
        graphicDesigns: graphicDesigns.status === "fulfilled" ? graphicDesigns.value : [],
        appointment: appointment.status === "fulfilled" ? appointment.value : [],
      };
  
      res.status(200).json({
        success: true,
        message: "All model data fetched successfully",
        allData,
      });
  
    } catch (error) {
      console.error("Error fetching all data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch data from models",
        error: error.message,
      });
    }
  };
  


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
  




// ******************************here upadating the status based on model (using single api route)******************************


// Model Mapping (make sure this is aligned with your frontend)
const modelMapping = {
  application: applicationModel,
  appointment: AppointmentModel,
  documenttranslation: documentTranslationModel,
  epassports: ePassportModel,
  // graphicDesign: GraphicDesignModel,
  graphicdesigns: GraphicDesignModel,
  japanvisit: japanVisitApplicationModel, 
  otherservice: OtherServiceModel,
};

// Route to update step status
exports.updateStepStatus = async (req, res) => {
  const { clientId, steps } = req.body;

  try {
    // Loop through each step and update it
    for (let step of steps) {
      const { stepId, status, modelName } = step;

      // Log the incoming modelName to ensure correct casing
      console.log('Incoming Model Name:', modelName); // Log incoming model name

      // Map modelName to lowercase and check
      const Model = modelMapping[modelName.toLowerCase()];
      if (!Model) {
        return res.status(400).json({ success: false, message: `Invalid model names: ${modelName}` });
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










