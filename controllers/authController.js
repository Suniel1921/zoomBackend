
//register controller
const authModel = require("../models/newModel/authModel");
const bcrypt = require('bcryptjs');
const  JWT = require ("jsonwebtoken");
const ClientModel = require("../models/newModel/clientModel");
const SuperAdminModel = require("../models/newModel/superAdminModel");
const AdminModel = require ("../models/newModel/adminModel");

exports.register = async (req, res) => {
  try {
    const { fullName, phone, nationality, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !phone || !nationality || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user already exists
    const userExit = await authModel.findOne({ email });
    if (userExit) {
      return res.status(409).json({ success: false, message: 'user already exist' });
    }

    // Hashing user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user in database
    const newUser = await authModel.create({
      fullName, 
      phone, 
      nationality, 
      email, 
      password: hashedPassword
    });

    // Respond with the created user data and success message
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in.',
      user: newUser // Include the new user object
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




//login controller

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    let user = await authModel.findOne({ email });
    let isClientModel = false;
    let isSuperAdminModel = false;
    let isAdminModel = false;

    // Check if the user exists in ClientModel
    if (!user) {
      user = await ClientModel.findOne({ email });
      isClientModel = true;
    }

    // Check if the user exists in SuperAdminModel
    if (!user) {
      user = await SuperAdminModel.findOne({ email });
      isSuperAdminModel = true;
    }

    //check if the admin exits in adminmodel
    if(!user){
      user = await AdminModel.findOne( {email });
      isAdminModel = true;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = JWT.sign(
      { _id: user._id, email: user.email, role: isSuperAdminModel ? 'superadmin' : (user.role || 'client') },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    const fullName = isClientModel ? user.name : (isSuperAdminModel ? user.email : user.fullName);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    
      user: {
              id: user._id,
              fullName, 
              email: user.email,
              role: user.role || 'client', 
              phone: user.phone,
              profilePhoto: user.profilePhoto
              },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
    });
  }
};





// ***********************FORGOT PASSWORD****************************

//FORGOT PASSOWRD CONTROLLER
const nodemailer = require('nodemailer');
const tempUserStore = new Map(); // You may use a better in-memory store or database for production

// FORGOT PASSWORD CONTROLLER
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find the user in any of the models
    let user = await ClientModel.findOne({ email });
    if (!user) user = await SuperAdminModel.findOne({ email });
    if (!user) user = await AdminModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    tempUserStore.set(email, { otp, createdAt: Date.now() });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MYEMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MYEMAIL, 
      to: email,
      subject: 'Password Reset OTP - ZoomCreatives',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://zoomcreatives.jp/wp-content/uploads/2024/03/Asset-1@300x-2048x664.png" alt="ZoomCreatives Logo" style="max-width: 150px;">
          </div>
          <p>Hello User,</p>
          <p>We received a request to reset the password for your ZoomCreatives account. If you did not request a password reset, please ignore this email.</p>
          <p>To reset your password, please use the following One-Time Password (OTP):</p>
          <p style="font-size: 18px; font-weight: bold; color: #3d82c5;">${otp}</p>
          <p>This code is valid for 10 minutes. Simply enter this code on the password reset page to create a new password for your account.</p>
          <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
          <p>Best regards,<br/>The ZoomCreatives Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'OTP sent to email. Please verify to reset password.' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ success: false, message: 'Internal server error ' });
  }
};

// RESET PASSWORD CONTROLLER
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const storedData = tempUserStore.get(email);
    if (!storedData || storedData.otp !== parseInt(otp) || Date.now() - storedData.createdAt > 600000) { // 10 minutes
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password for the correct user model
    let user = await ClientModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    if (!user) user = await SuperAdminModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    if (!user) user = await AdminModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    tempUserStore.delete(email);

    const token = JWT.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successful.',
      token,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};






















// **********************************CREATE SUPER ADMIN CONTROLLER*************************************************

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




exports.getAllSuperAdmins = async (req, res) => {
  try {
    // Fetch all super admins from the database
    const superAdmins = await SuperAdminModel.find({}, 'name email createdAt superAdminPhoto');

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




// ************upload multiple file***********

// const upload = require('../config/multerConfig');
// const cloudinary = require('cloudinary').v2;

// exports.uploadSuperAdminPhoto = [
//   upload.array('clientFiles', 1), // Handling multiple file uploads (max 5 files)
//   async (req, res) => {
//     try {
//       const { id } = req.params; // Use 'id' as parameter for the super admin

//       if (!id) {
//         return res.status(404).json({ success: false, message: 'Super Admin ID not found' });
//       }

//       // Check if files were uploaded
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No files uploaded' });
//       }

//       // Find the super admin by ID
//       const superAdmin = await SuperAdminModel.findById(id);
//       if (!superAdmin) {
//         return res.status(404).json({ success: false, message: 'Super Admin not found' });
//       }

//       // Process each file and upload to Cloudinary
//       const fileUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         fileUrls.push(result.secure_url); // Collect all the uploaded file URLs
//       }

//       // Save the uploaded file URLs to the super admin model
//       superAdmin.superAdminPhoto = superAdmin.superAdminPhoto || []; // Initialize the array if not already
//       superAdmin.superAdminPhoto.push(...fileUrls); // Add the new file URLs

//       // Save the updated super admin data
//       await superAdmin.save();

//       return res.status(200).json({success: true, message: 'Files uploaded successfully', fileUrls, 
//       });
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       return res.status(500).json({ success: false, message: 'Server error while uploading files' });
//     }
//   }
// ];





// // Get Super Admin by ID
// exports.GetSuperAdminById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch super admin from database by ID
//     const superAdmin = await SuperAdminModel.findById(id);

//     if (!superAdmin) {
//       return res.status(404).json({ success: false, message: 'Super Admin not found' });
//     }

//     // Respond with the super admin data
//     return res.status(200).json({
//       success: true,
//       message: 'Super Admin fetched successfully',
//       superAdmin,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };



// // Update Super Admin
// exports.UpdateSuperAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email } = req.body;

//     // Fetch super admin from the database
//     const superAdmin = await SuperAdminModel.findById(id);

//     if (!superAdmin) {
//       return res.status(404).json({ success: false, message: 'Super Admin not found' });
//     }

//     // Update fields
//     if (name) superAdmin.name = name;
//     if (email) superAdmin.email = email;

//     // Save the updated super admin
//     const updatedSuperAdmin = await superAdmin.save();

//     // Respond with updated super admin data
//     return res.status(200).json({
//       success: true,
//       message: 'Super Admin updated successfully',
//       superAdmin: updatedSuperAdmin,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };






// //udpate super admin password

// exports.UpdateSuperAdminPassword = async (req, res) => {
//   const { id } = req.params;
//   const { currentPassword, newPassword } = req.body;

//   try {
//     const user = await SuperAdminModel.findById(id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Validate current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Current password is incorrect' });
//     }

//     // Hash and update new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     res.json({ success: true, message: 'Password updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


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



// exports.UpdateSuperAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email } = req.body;

//     // Find user in both models
//     let user = await SuperAdminModel.findById(id);
//     if (!user) {
//       user = await AdminModel.findById(id);
//     }

//     // Check if user exists
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'Admin or Super Admin not found' });
//     }

//     // Update fields
//     if (name) user.name = name;
//     if (email) user.email = email;

//     // Save the updated data
//     const updatedUser = await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'User updated successfully',
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.error('Error updating Super Admin:', error);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };






exports.updateSuperAdmin = async (req, res) => {
  const { name, email } = req.body;
  const superAdminId = req.params.id;
  const superAdminPhoto = req.file ? req.file.path : null;  // Check if a new file is uploaded

  try {
    // Find the super admin by ID first
    const existingAdmin = await SuperAdminModel.findById(superAdminId);

    if (!existingAdmin) {
      return res.status(404).json({ message: 'Super Admin not found' });
    }

    // If no new photo is uploaded, keep the existing superAdminPhoto
    const updatedAdminData = {
      name,
      email,
      superAdminPhoto: superAdminPhoto || existingAdmin.superAdminPhoto, // Preserve old photo if no new one
    };

    // Update the super admin document
    const updatedAdmin = await SuperAdminModel.findByIdAndUpdate(superAdminId, updatedAdminData, { new: true });

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
      user = await AdminModel.findById(id); // Check AdminModel
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


















































// Protected route controller
exports.protectedRoute = async (req, res) => {
  res.status(200).json({ ok: true });
}

// Admin route controller
exports.admin = (req, res) => {
  res.status(200).json({ ok: true });
}













