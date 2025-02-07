const AdminModel = require("../models/newModel/adminModel");
const SuperAdminModel = require("../models/newModel/superAdminModel");
const bcrypt = require('bcryptjs');

//create superAdmin controller (for other business)
exports.CreateSuperAdmin = async (req, res) => {
    try {
      const { name, email, password} = req.body;
  
      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
  
      // Check if user already exists
      const superAdminExit = await SuperAdminModel.findOne({ email });
      if (superAdminExit) {
        return res.status(409).json({ success: false, message: 'superAdmin already exist' });
      }
  
      // Hashing user password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save new user in database
      const newUser = await SuperAdminModel.create({
        name,
        email, 
        password: hashedPassword
      });
  
      // Respond with the created user data and success message
      return res.status(201).json({
        success: true,
        message: 'Super Admin account created successfully! Please log in.',
        user: newUser 
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  delete controller 
  
  
  
  
  exports.getAllSuperAdmins = async (req, res) => {
    try {
      // Fetch all super admins from the database
      const superAdmins = await SuperAdminModel.find({}, 'name email role createdAt superAdminPhoto');
  
      // Respond with the list of super admins
      return res.status(200).json({
        success: true,
        message: 'Super admins fetched successfully!',
        superAdmins,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };







  // Delete superAdmin controller
exports.deleteSuperAdmin = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the ID is provided
      if (!id) {
        return res.status(400).json({ success: false, message: 'Super Admin ID is required' });
      }
  
      // Find and delete the super admin by ID
      const deletedSuperAdmin = await SuperAdminModel.findByIdAndDelete(id);
  
      // If no super admin is found with the given ID
      if (!deletedSuperAdmin) {
        return res.status(404).json({ success: false, message: 'Super Admin not found' });
      }
  
      // Respond with success message
      return res.status(200).json({
        success: true,
        message: 'Super Admin deleted successfully',
        data: deletedSuperAdmin,
      });
    } catch (error) {
      console.error('Error deleting super admin:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  

  
  
  
  // ************upload multiple file***********
  
  exports.GetSuperAdminById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch super admin by ID
      const superAdmin = await SuperAdminModel.findById(id).select('name email role superAdminPhoto');
      const adminUser = await AdminModel.findById(id).select('name email role superAdminPhoto');
  
      // Check if no superAdmin and no admin found
      if (!superAdmin && !adminUser) {
        return res.status(404).json({ success: false, message: 'Admin or Super Admin not found' });
      }
  
      // Respond with the user data
      return res.status(200).json({
        success: true,
        message: 'Admin fetched successfully',
        data: superAdmin || adminUser, // Return whichever user is found
      });
  
    } catch (error) {
      console.error('Error fetching Super Admin:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  


  exports.updateSuperAdmin = async (req, res) => {
    const { name, email } = req.body;
    const superAdminId = req.params.id;
    const superAdminPhoto = req.file ? req.file.path : null; 
  
    try {
      // Find the super admin in both models
      const existingSuperAdmin = await SuperAdminModel.findById(superAdminId);
      const existingAdmin = await AdminModel.findById(superAdminId);
  
      if (!existingSuperAdmin && !existingAdmin) {
        return res.status(404).json({ message: 'Super Admin not found in both models' });
      }
  
      // Determine the model to update and retain the existing photo if no new one is uploaded
      const targetModel = existingSuperAdmin ? SuperAdminModel : AdminModel;
      const currentData = existingSuperAdmin || existingAdmin;
  
      const updatedAdminData = {
        name,
        email,
        superAdminPhoto: superAdminPhoto || currentData.superAdminPhoto, 
      };
  
      // Update the super admin document
      const updatedAdmin = await targetModel.findByIdAndUpdate(superAdminId, updatedAdminData, { new: true });
  
      res.json({ message: 'Profile updated successfully', data: updatedAdmin });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  
  
  
  
  
  exports.UpdateSuperAdminPassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
  
    try {
      // Find user in both models
      let user = await SuperAdminModel.findById(id);
      if (!user) {
        user = await AdminModel.findById(id); 
      }
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'Admin or Super Admin not found' });
      }
  
      // Validate current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
  
      // Hash and update new password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  



  
  
  
  