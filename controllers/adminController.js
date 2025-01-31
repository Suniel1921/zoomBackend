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




// Get all admins for the authenticated superadmin or admin
exports.getAdmins = async (req, res) => {
  const { _id, role, superAdminId } = req.user;

  // Check for valid role (superadmin or admin)
  if (!role || (role !== 'superadmin' && role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
  }

  try {
    let query = {};

    if (role === 'superadmin') {
      // SuperAdmin: Fetch all admins under their `superAdminId`
      query = { superAdminId: _id };
    } else if (role === 'admin') {
      // Admin: Fetch admins created by the admin or under their `superAdminId`
      query = { $or: [{ createdBy: _id }, { superAdminId }] };
    }

    const admins = await AdminModel.find(query)
      .exec(); 

    // if (admins.length === 0) {
    //   return res.status(404).json({ success: false, message: 'No admins found' });
    // }

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error('Error fetching admins:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};




// Get admin by ID for the authenticated superAdmin
exports.getAdminById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 
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
    const { _id: superAdminId } = req.user; 
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
    const { _id: superAdminId } = req.user; 

    const admin = await AdminModel.findOneAndDelete({ _id: req.params.id, superAdminId });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found or you do not have access to it' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting admin', error: error.message });
  }
};



















// // Create new admin controller
// exports.createAdmin = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; // Getting superAdminId from the authenticated user
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
//     res.status(201).json({ success: true, message: 'Admin created successfully', admin });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error creating admin', error: error.message });
//   }
// };

// // Get all admins for the authenticated superadmin or admin
// exports.getAdmins = async (req, res) => {
//   const { _id, role, superAdminId } = req.user;

//   // Check for valid role (superadmin or admin)
//   if (!role || (role !== 'superadmin' && role !== 'admin')) {
//     return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
//   }

//   try {
//     let query = {};

//     if (role === 'superadmin') {
//       // SuperAdmin: Fetch all admins under their `superAdminId`
//       query = { superAdminId: _id };
//     } else if (role === 'admin') {
//       // Admin: Fetch admins created by the admin or under their `superAdminId`
//       query = { $or: [{ createdBy: _id }, { superAdminId }] };
//     }

//     const admins = await AdminModel.find(query).exec(); 

//     return res.status(200).json({
//       success: true,
//       admins,
//     });
//   } catch (error) {
//     console.error('Error fetching admins:', error.message);
//     return res.status(500).json({ success: false, message: 'Internal Server Error', error });
//   }
// };

// // Get admin by ID for the authenticated superAdmin
// exports.getAdminById = async (req, res) => {
//   try {
//     const { _id: superAdminId } = req.user; 
//     const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId });
    
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

//     const admin = await AdminModel.findOne({ _id: req.params.id, superAdminId });
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
