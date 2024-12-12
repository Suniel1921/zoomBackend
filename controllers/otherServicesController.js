const ClientModel = require("../models/newModel/clientModel");
const OtherServiceModel = require("../models/newModel/otherServicesModel");


// Create a new service
exports.createOtherServices = async (req, res) => {
  try {
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
    } = req.body;

    // Validate if the client exists
    const client = await ClientModel.findById(clientId);
    if (!client) {
      return res.status(400).json({success: false, message: 'Client not found'});
    }

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
    // return res.status(500).json({ error: 'Something went wrong' });
    return res.status(500).json({success: false, message: 'internal server error', error})
  }
};

// Get all services
exports.getAllOtherServices = async (req, res) => {
  try {
    const services = await OtherServiceModel.find().populate('clientId');
    return res.status(200).json({success: true, message: 'Services fetched successfully', data: services,});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get service by ID
exports.getOtherServicesByID = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await OtherServiceSchema.findById(id).populate('clientId', 'name phone');
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
};


// Update a service by ID
// Update a service by ID
exports.updateOtherServices = async (req, res) => {
  const { id } = req.params;
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
  } = req.body;

  try {
    // Find the service by ID
    const service = await OtherServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update the service fields
    service.clientId = clientId;
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
    return res.status(500).json({success: false, message: 'Internal server error', error });
  }
};


// Delete a service by ID
exports.deleteOtherServices = async (req, res) => {
    const { id } = req.params;
    try {
      // Find and delete the service using findByIdAndDelete
      const service = await OtherServiceModel.findByIdAndDelete(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete service' });
    }
  };
  
