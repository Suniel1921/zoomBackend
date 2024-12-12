const GraphicDesignModel = require("../models/newModel/graphicDesingModel");


exports.createGraphicDesign = async (req, res) => {
  try {
    const {
      clientId, businessName, mobileNo, landlineNo, address, designType,
      amount, advancePaid, remarks, status, deadline
    } = req.body;

    const dueAmount = amount - advancePaid;
    const paymentStatus = dueAmount > 0 ? 'Due' : 'Paid';

    const designJob = new GraphicDesignModel({
      clientId,
      businessName,
      mobileNo,
      landlineNo,
      address,
      designType,
      amount,
      advancePaid,
      remarks,
      status,
      deadline,
      dueAmount,
      paymentStatus
    });

    await designJob.save();

    res.status(201).json({success: true, message: 'Design job created successfully', designJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error creating design job', error });
  }
};

// Get all Design Jobs
exports.getAllGraphicDesign = async (req, res) => {
  try {
    const designJobs = await GraphicDesignModel.find().populate('clientId', 'name')  // Populate client information
      .sort({ createdAt: -1 });

    res.status(200).json({success: true, message: 'data fetched',designJobs});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error fetching design jobs', error });
  }
};

// Get a Design Job by ID
exports.getGraphicDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const designJob = await GraphicDesignModel.findById(id)
      .populate('clientId', 'name');

    if (!designJob) {
      return res.status(404).json({success: false, message: 'Design job not found' });
    }

    res.status(200).json({success: true, message: 'data fetched sucessfully', designJob});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching design job', error });
  }
};

// Update a Design Job by ID
exports.updateGraphicDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const designJob = await GraphicDesignModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('clientId', 'name');

    if (!designJob) {
      return res.status(404).json({success: false, message: 'Design job not found' });
    }

    res.status(200).json({success: true, message: 'Design job updated successfully', designJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error updating design job', error });
  }
};

// Delete a Design Job by ID
exports.deleteGraphicDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const designJob = await GraphicDesignModel.findByIdAndDelete(id);

    if (!designJob) {
      return res.status(404).json({success: false, message: 'Design job not found' });
    }

    res.status(200).json({success: true, message: 'Design job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error deleting design job', error });
  }
};
