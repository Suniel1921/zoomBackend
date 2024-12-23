
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/newModel/adminModel');




// Create new admin controller
exports.createAdmin = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Getting superAdminId from the authenticated user
    const { name, email, password, role, status } = req.body;

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new AdminModel({
      superAdminId, 
      name,
      email,
      password: hashedPassword,
      role,
      status,
      permissions: [],
    });

    await admin.save();
    res.status(201).json({ success: true, message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating admin', error: error.message });
  }
};



// Get all admins for the authenticated superAdmin
exports.getAdmins = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 

    const admins = await AdminModel.find({ superAdminId });
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admins', error: error.message });
  }
};



// Get admin by ID for the authenticated superAdmin
exports.getAdminById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Get superAdminId from the authenticated user
    const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId });
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
    }
    
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin', error: error.message });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Get superAdminId from the authenticated user
    const { name, email, role, status } = req.body;

    const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.role = role || admin.role;
    admin.status = status || admin.status;

    await admin.save();
    res.status(200).json({ success: true, message: 'Admin updated successfully', admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admin', error: error.message });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; // Get superAdminId from the authenticated user

    const admin = await AdminModel.findOneAndDelete({ _id: req.params.id, superAdminId });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting admin', error: error.message });
  }
};
