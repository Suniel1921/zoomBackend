const ClientModel = require("../models/newModel/clientModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");


// Create a new Service Controller
exports.createOtherServices = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Extract superAdminId from authenticated user
    const {
      clientId,
      serviceTypes,
      otherServiceDetails,
      contactChannel,
      deadline,
      amount,
      paidAmount,
      discount,
      paymentMethod,
      handledBy,
      jobStatus,
      remarks,
      steps, 
    } = req.body;

    // Validate if the client exists
    const client = await ClientModel.findOne({ _id: clientId, superAdminId });
    if (!client) {
      return res.status(400).json({ success: false, message: 'Client not found or unauthorized' });
    }

    // Validate and initialize steps if provided
    const applicationSteps = steps && Array.isArray(steps) ? steps : [];

    // Calculate the due amount
    const dueAmount = amount - (paidAmount + discount);

    // Create a new service record
    const newService = new OtherServiceModel({
      clientId,
      serviceTypes,
      otherServiceDetails,
      contactChannel,
      deadline,
      amount,
      paidAmount,
      discount,
      paymentMethod,
      handledBy,
      jobStatus,
      remarks,
      dueAmount,
      paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
      steps: applicationSteps, 
      superAdminId, 
    });

    // Save the service to the database
    await newService.save();

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};


// Get all services for the authenticated superAdmin
exports.getAllOtherServices = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const services = await OtherServiceModel.find({ superAdminId }).populate('clientId');
    return res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch services', error });
  }
};

// Get service by ID for the authenticated superAdmin
exports.getOtherServicesByID = async (req, res) => {
  const { id } = req.params;
  try {
    const { _id: superAdminId } = req.user;
    const service = await OtherServiceModel.findOne({ _id: id, superAdminId }).populate('clientId', 'name phone');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service', error });
  }
};

// Update a service by ID for the authenticated superAdmin
exports.updateOtherServices = async (req, res) => {
  const { id } = req.params;
  const {
    serviceTypes,
    otherServiceDetails,
    contactChannel,
    deadline,
    amount,
    paidAmount,
    discount,
    paymentMethod,
    handledBy,
    jobStatus,
    remarks,
  } = req.body;

  try {
    const { _id: superAdminId } = req.user;

    // Find the service by ID with the superAdminId filter
    const service = await OtherServiceModel.findOne({ _id: id, superAdminId });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
    }

    // Update the service fields (clientId remains unchanged)
    service.serviceTypes = serviceTypes;
    service.otherServiceDetails = otherServiceDetails;
    service.contactChannel = contactChannel;
    service.deadline = deadline;
    service.amount = amount;
    service.paidAmount = paidAmount;
    service.discount = discount;
    service.paymentMethod = paymentMethod;
    service.handledBy = handledBy;
    service.jobStatus = jobStatus;
    service.remarks = remarks;

    // Recalculate the due amount
    service.dueAmount = amount - (paidAmount + discount);
    service.paymentStatus = service.dueAmount > 0 ? 'Due' : 'Paid';

    // Save the updated service
    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};



// Delete a service by ID for the authenticated superAdmin
exports.deleteOtherServices = async (req, res) => {
  const { id } = req.params;
  try {
    const { _id: superAdminId } = req.user;
    
    // Find and delete the service using findOneAndDelete with superAdminId check
    const service = await OtherServiceModel.findOneAndDelete({ _id: id, superAdminId });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete service', error });
  }
};
