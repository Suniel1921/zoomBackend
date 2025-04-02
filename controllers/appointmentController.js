
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

// Nodemailer and moment setup
const nodemailer = require('nodemailer');
const moment = require('moment');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

const generateEmailTemplate = ({ subject, greeting, message, details, statusColor, ctaText, ctaLink }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>${subject}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Orbitron', sans-serif; 
          background-color: #0a0a0a; 
          color: #ffffff; 
          line-height: 1.6; 
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); 
        }
        .header { 
          background: #fedc00; 
          padding: 20px; 
          text-align: center; 
          border-bottom: 2px solid rgba(255, 255, 255, 0.1); 
        }
        .header h1 { 
          color: #000000; 
          font-size: 24px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 2px; 
        }
        .content { 
          padding: 30px; 
        }
        .greeting { 
          font-size: 18px; 
          margin-bottom: 15px; 
          color: #fedc00; 
        }
        .message { 
          font-size: 14px; 
          margin-bottom: 25px; 
          color: #cccccc; 
        }
        .details { 
          background: rgba(255, 255, 255, 0.05); 
          padding: 20px; 
          border-radius: 8px; 
          font-size: 13px; 
        }
        .details div { 
          margin-bottom: 10px; 
          display: flex; 
          justify-content: space-between; 
        }
        .details .label { 
          color: #fedc00; 
          font-weight: 700; 
        }
        .details .value { 
          color: #ffffff; 
        }
        .status { 
          color: ${statusColor} !important; 
        }
        .cta { 
          text-align: center; 
          margin: 25px 0; 
        }
        .cta a { 
          display: inline-block; 
          padding: 12px 30px; 
          background: ${statusColor}; 
          color: #ffffff; 
          text-decoration: none; 
          border-radius: 25px; 
          font-size: 14px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          transition: all 0.3s ease; 
        }
        .cta a:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); 
        }
        .footer { 
          background: rgba(255, 255, 255, 0.03); 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #666666; 
          border-top: 1px solid rgba(255, 255, 255, 0.05); 
        }
        .footer a { 
          color: #fedc00; 
          text-decoration: none; 
          margin: 0 10px; 
        }
        @media (max-width: 600px) {
          .container { margin: 20px; }
          .content { padding: 20px; }
          .cta a { padding: 10px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Zoom Creatives</h1>
        </div>
        <div class="content">
          <h2 class="greeting">${greeting}</h2>
          <p class="message">${message}</p>
          <div class="details">
            ${details.map(({ label, value }) => `
              <div>
                <span class="label">${label}</span>
                <span class="value ${label === 'Status' ? 'status' : ''}">${value}</span>
              </div>
            `).join('')}
          </div>
          ${ctaText && ctaLink ? `
            <div class="cta">
              <a href="${ctaLink}">${ctaText}</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Best regards, The Zoom Creatives Team</p>
          <p>
            <a href="https://zoomcreatives.jp">Contact Us</a> | 
            <a href="https://zoomcreatives.jp">Visit Website</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.createAppointment = async (req, res) => {
  try {
    const { clientId, handledBy, ...appointmentData } = req.body;
    const { superAdminId, _id: createdBy, role } = req.user;

    if (role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Only superadmin or admin can create appointments' 
      });
    }

    const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

    const client = await ClientModel.findOne({ 
      _id: clientId, 
      superAdminId: clientSuperAdminId 
    });
    if (!client) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client not found or unauthorized' 
      });
    }

    const appointment = new AppointmentModel({
      clientId,
      handledBy,
      ...appointmentData,
      superAdminId: clientSuperAdminId,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await appointment.save();

    const formattedDate = moment(appointmentData.date).format('MMMM Do YYYY');
    const formattedTime = appointmentData.time 
      ? moment(appointmentData.time, 'HH:mm').format('h:mm A') 
      : 'Not specified';
    const meetingType = appointmentData.meetingType
      ? appointmentData.meetingType.charAt(0).toUpperCase() + appointmentData.meetingType.slice(1)
      : 'Not specified';

    const emailSubject = 'New Appointment Scheduled';
    const emailTemplate = generateEmailTemplate({
      subject: emailSubject,
      greeting: `Hello ${client.name},`,
      message: 'Your appointment has been successfully scheduled:',
      details: [
        { label: 'Date & Time', value: `${formattedDate} at ${formattedTime}` },
        { label: 'Meeting Type', value: meetingType },
        { label: 'Duration', value: `${appointmentData.duration || 'Not specified'} minutes` },
        { label: 'Location', value: appointmentData.location || 'Not provided' },
        { label: 'Handled By', value: handledBy || 'Not assigned' },
      ],
      statusColor: '#00ff9d',
      ctaText: 'View Appointment',
      ctaLink: 'https://crm.zoomcreatives.jp/client-login',
    });

    const mailOptions = {
      from: `"Zoom Creatives" <${process.env.MYEMAIL}>`,
      to: client.email,
      subject: emailSubject,
      html: emailTemplate,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error('Email sending failed:', error);
      else console.log('Email sent successfully:', info.response);
    });

    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully', 
      appointment 
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create appointment', 
      error: error.message 
    });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const { role, superAdminId, _id: userId } = req.user;
    
    let query = {};
    if (role === 'admin') {
      query = { superAdminId };
    } else if (role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const appointments = await AppointmentModel.find(query)
      .populate('clientId', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ 
      success: true, 
      message: 'Appointments fetched successfully', 
      appointments 
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve appointments', 
      error: error.message 
    });
  }
};

exports.getAppointmentsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { superAdminId, role } = req.user;

    const query = { clientId };
    if (role === 'admin') {
      query.superAdminId = superAdminId;
    }

    const appointments = await AppointmentModel.find(query)
      .populate('clientId', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    if (appointments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No appointments found for this client' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Appointments fetched successfully', 
      appointments 
    });
  } catch (error) {
    console.error('Get appointments by client error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve appointments', 
      error: error.message 
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode, handledBy, ...updateData } = req.body;

    // Check if req.user is defined
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User not authenticated' 
      });
    }

    const { role, superAdminId } = req.user;

    if (role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Only superadmin or admin can update appointments' 
      });
    }

    if (!['edit', 'reschedule'].includes(mode)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid mode. Must be "edit" or "reschedule"' 
      });
    }

    let isRescheduled = false;
    if (mode === 'reschedule') {
      const { date, time } = updateData;
      if (!date || !time) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date and time are required for rescheduling' 
        });
      }
      updateData.date = new Date(date);
      updateData.time = time;
      isRescheduled = true;
    }

    if (handledBy) updateData.handledBy = handledBy;
    updateData.updatedAt = new Date();

    const updatedAppointment = await AppointmentModel.findOneAndUpdate(
      { _id: id, superAdminId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found or unauthorized' 
      });
    }

    if (isRescheduled) {
      const client = await ClientModel.findById(updatedAppointment.clientId);
      const formattedDate = moment(updatedAppointment.date).format('MMMM Do YYYY');
      const formattedTime = updatedAppointment.time 
        ? moment(updatedAppointment.time, 'HH:mm').format('h:mm A') 
        : 'Not specified';

      const emailSubject = 'Appointment Rescheduled';
      const emailTemplate = generateEmailTemplate({
        subject: emailSubject,
        greeting: `Hello ${client.name},`,
        message: 'Your appointment has been rescheduled:',
        details: [
          { label: 'New Date & Time', value: `${formattedDate} at ${formattedTime}` },
          { label: 'Status', value: 'Rescheduled' },
          { label: 'Duration', value: `${updatedAppointment.duration} minutes` },
          { label: 'Location', value: updatedAppointment.location || 'Not provided' },
          { label: 'Handled By', value: updatedAppointment.handledBy || 'Not assigned' },
        ],
        statusColor: '#fedc00',
        ctaText: 'View Details',
        ctaLink: 'https://crm.zoomcreatives.jp/client-login',
      });

      const mailOptions = {
        from: `"Zoom Creatives" <${process.env.MYEMAIL}>`,
        to: client.email,
        subject: emailSubject,
        html: emailTemplate,
      };

      transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${mode}d successfully`,
      updatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update appointment', 
      error: error.message 
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const { superAdminId, role } = req.user;

    if (role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Only superadmin or admin can update status' 
      });
    }

    if (!['Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be Completed, Cancelled, or Rescheduled' 
      });
    }

    const appointment = await AppointmentModel.findOne({ _id: id, superAdminId });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found or unauthorized' 
      });
    }

    appointment.status = status;
    const now = new Date();
    
    if (status === 'Completed') {
      appointment.completedAt = now;
    } else if (status === 'Cancelled') {
      appointment.cancelledAt = now;
    } else if (status === 'Rescheduled') {
      const { date, time } = req.body;
      if (!date || !time) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date and time required for rescheduling' 
        });
      }
      appointment.date = new Date(date);
      appointment.time = time;
      appointment.rescheduledAt = now;
    }
    appointment.updatedAt = now;

    await appointment.save();

    const client = await ClientModel.findById(appointment.clientId);
    const formattedDate = moment(appointment.date).format('MMMM Do YYYY');
    const formattedTime = appointment.time 
      ? moment(appointment.time, 'HH:mm').format('h:mm A') 
      : 'Not specified';

    let emailSubject = '';
    let message = '';
    let statusColor = '';
    let ctaText = '';
    let ctaLink = '';

    switch (status) {
      case 'Completed':
        emailSubject = 'Appointment Completed';
        message = 'Your appointment has been successfully completed.';
        statusColor = '#00ff9d';
        ctaText = 'Give Feedback';
        ctaLink = 'https://zoomcreatives.jp/';
        break;
      case 'Cancelled':
        emailSubject = 'Appointment Cancelled';
        message = 'Your appointment has been cancelled.';
        statusColor = '#ff3366';
        ctaText = 'Reschedule Now';
        ctaLink = 'https://crm.zoomcreatives.jp/client-portal';
        break;
      case 'Rescheduled':
        emailSubject = 'Appointment Rescheduled';
        message = 'Your appointment has been rescheduled:';
        statusColor = '#fedc00';
        ctaText = 'View Details';
        ctaLink = 'https://crm.zoomcreatives.jp/client-portal';
        break;
    }

    const emailTemplate = generateEmailTemplate({
      subject: emailSubject,
      greeting: `Hello ${client.name},`,
      message,
      details: [
        { label: 'Date & Time', value: `${formattedDate} at ${formattedTime}` },
        { label: 'Status', value: status },
        { label: 'Duration', value: `${appointment.duration} minutes` },
        { label: 'Location', value: appointment.location || 'Not provided' },
        { label: 'Handled By', value: appointment.handledBy || 'Not assigned' },
      ],
      statusColor,
      ctaText,
      ctaLink,
    });

    const mailOptions = {
      from: `"Zoom Creatives" <${process.env.MYEMAIL}>`,
      to: client.email,
      subject: emailSubject,
      html: emailTemplate,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully`,
      appointment,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update appointment status', 
      error: error.message 
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { superAdminId, role } = req.user;
    const { id } = req.params;

    if (role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Only superadmin or admin can delete appointments' 
      });
    }

    const deletedAppointment = await AppointmentModel.findOneAndDelete({ 
      _id: id, 
      superAdminId 
    });

    if (!deletedAppointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found or unauthorized' 
      });
    }

    const client = await ClientModel.findById(deletedAppointment.clientId);
    const emailSubject = 'Appointment Cancelled';
    const emailTemplate = generateEmailTemplate({
      subject: emailSubject,
      greeting: `Hello ${client.name},`,
      message: 'Your scheduled appointment has been cancelled:',
      details: [
        { label: 'Original Date', value: moment(deletedAppointment.date).format('MMMM Do YYYY') },
        { label: 'Original Time', value: deletedAppointment.time 
          ? moment(deletedAppointment.time, 'HH:mm').format('h:mm A') 
          : 'Not specified' },
        { label: 'Status', value: 'Cancelled' },
        { label: 'Handled By', value: deletedAppointment.handledBy || 'Not assigned' },
      ],
      statusColor: '#ff3366',
      ctaText: 'Schedule New Appointment',
      ctaLink: 'https://crm.zoomcreatives.jp/client-portal',
    });

    const mailOptions = {
      from: `"Zoom Creatives" <${process.env.MYEMAIL}>`,
      to: client.email,
      subject: emailSubject,
      html: emailTemplate,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete appointment', 
      error: error.message 
    });
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
  epassport: ePassportModel,
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

      // Log the incoming modelName for debugging
      console.log("Incoming Model Name:", modelName);

      // Map modelName to lowercase and validate
      const Model = modelMapping[modelName.toLowerCase()];
      if (!Model) {
        return res.status(400).json({
          success: false,
          message: `Invalid model name: ${modelName}`,
        });
      }

      // Update both status and updatedAt for the specific step
      const result = await Model.updateOne(
        { "steps._id": stepId },
        {
          $set: {
            "steps.$.status": status,
            "steps.$.updatedAt": new Date(), // ADDED: Set updatedAt to current date/time
          },
        }
      );

      // CHANGE: Updated from nModified to modifiedCount (modern MongoDB driver)
      if (result.modifiedCount === 0) {
        console.log(`No document updated for stepId ${stepId}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Statuses updated successfully!",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update statuses",
      error: error.message,
    });
  }
};









