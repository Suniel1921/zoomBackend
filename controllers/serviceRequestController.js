const ServiceRequestModel = require('../models/newModel/serviceRequestModel');
const mongoose = require('mongoose');



// Create a new service request
// exports.createServiceRequest = async (req, res) => {
//   try {
//     const { clientId, clientName, phoneNumber, serviceId, serviceName, message } = req.body;

//     // Include superAdminId if available
//     const superAdminId = req.user ? req.user._id : null;

//     if (!clientName || !phoneNumber || !serviceName || !message) {
//       return res.status(400).json({ error: 'All fields are required.' });
//     }

//     // Create a new service request and include clientId
//     const newRequest = new ServiceRequestModel({
//       superAdminId,
//       clientId,  // clientId is included here
//       clientName,
//       phoneNumber,
//       serviceId,
//       serviceName,
//       message,
//     });

//     await newRequest.save();
//     res.status(201).json({ message: 'Service request created successfully.', data: newRequest });
//   } catch (error) {
//     console.error('Error creating service request:', error);
//     res.status(500).json({ error: 'Failed to create service request.' });
//   }
// };


// //Get all service requests Controller
// exports.getAllServiceRequests = async (req, res) => {
//   try {
//     const requests = await ServiceRequestModel.find().sort({ createdAt: -1 });
//     res.status(200).json({ data: requests });
//   } catch (error) {
//     console.error('Error fetching service requests:', error);
//     res.status(500).json({ error: 'Failed to fetch service requests.' });
//   }
// };








exports.createServiceRequest = async (req, res) => {
  try {
    const { clientId, clientName, phoneNumber, serviceId, serviceName, message } = req.body;

    const superAdminId = req.user ? req.user._id : null;

    if (!clientName  || !serviceName || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newRequest = new ServiceRequestModel({
      superAdminId,
      clientId,
      clientName,
      phoneNumber,
      serviceId,
      serviceName,
      message,
    });

    await newRequest.save();

    // Emit notification to connected clients
    req.io.emit('newServiceRequest', {
      clientId,
      clientName,
      phoneNumber,
      serviceName,
      message,
      createdAt: newRequest.createdAt,
    });

    res.status(201).json({ message: 'Service request created successfully.', data: newRequest });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: 'Failed to create service request.' });
  }
};





// Get all service requests Controller
exports.getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequestModel.find().sort({ createdAt: -1 });

    // Emit notification to connected clients (only when requests are fetched successfully)
    req.io.emit('newServiceRequests', {
      message: 'New service requests fetched.',
      data: requests,
    });

    res.status(200).json({ data: requests });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests.' });
  }
};








// Get a single service request by ID
exports.getServiceRequestById = async (req, res) => {
  try {
    const { clientId } = req.params; // Assuming the URL param is clientId

    // Fetch the service request based on clientId
    const request = await ServiceRequestModel.findOne({ clientId });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    res.status(200).json({ data: request });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ error: 'Failed to fetch service request.' });
  }
};




// Update a service request status Controller

exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body;

    // Validate if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service request ID.' });
    }

    // Validate status value
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    // Update the service request status
    const updatedRequest = await ServiceRequestModel.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    res.status(200).json({ success: true, message: 'Service request updated successfully.', data: updatedRequest });
  } catch (error) {
    console.error('Error updating service request:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};


// Delete a service request
exports.deleteServiceRequest = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 
    const { id } = req.params;

    const deletedRequest = await ServiceRequestModel.findOneAndDelete({ _id: id, superAdminId });

    if (!deletedRequest) {
      return res.status(404).json({ error: 'Service request not found or you do not have access to it.' });
    }

    res.status(200).json({ message: 'Service request deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service request:', error);
    res.status(500).json({ error: 'Failed to delete service request.' });
  }
};
