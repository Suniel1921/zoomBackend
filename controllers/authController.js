
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
      user: newUser 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




//login controller

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email and password are required" });
//     }

//     let user = await authModel.findOne({ email });
//     let isClientModel = false;
//     let isSuperAdminModel = false;
//     let isAdminModel = false;

//     // Check if the user exists in ClientModel
//     if (!user) {
//       user = await ClientModel.findOne({ email });
//       isClientModel = true;
//     }

//     // Check if the user exists in SuperAdminModel
//     if (!user) {
//       user = await SuperAdminModel.findOne({ email });
//       isSuperAdminModel = true;
//     }

//     //check if the admin exits in adminmodel
//     if(!user){
//       user = await AdminModel.findOne( {email });
//       isAdminModel = true;
//     }

//     if (!user) {
//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     // Generate JWT token
//     const token = JWT.sign(
//       { _id: user._id, email: user.email, role: isSuperAdminModel ? 'superadmin' : (user.role || 'client') },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     const fullName = isClientModel ? user.name : (isSuperAdminModel ? user.email : user.fullName);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
    
//       user: {
//               id: user._id,
//               fullName, 
//               email: user.email,
//               role: user.role || 'client', 
//               phone: user.phone,
//               profilePhoto: user.profilePhoto
//               },
//       token,
//     });
//   } catch (error) {
//     console.error('Login Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during login. Please try again later.",
//     });
//   }
// };




exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // List of models to check, in order of precedence
    const models = [
      { model: SuperAdminModel, role: "superadmin", include: {} },
      { model: AdminModel, role: "admin", include: { superAdminId: 1 } },
      { model: ClientModel, role: "client", include: { superAdminId: 1 } },
      { model: authModel, role: "user", include: {} }, 
    ];

    let user = null;
    let role = null;
    let additionalData = {};

    // Check each model for the user
    for (const { model, role: modelRole, include } of models) {
      user = await model.findOne({ email }).select({ ...include, password: 1, name: 1, email: 1, phone: 1, profilePhoto: 1 });
      if (user) {
        role = modelRole;
        additionalData = include;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Prepare JWT payload
    const payload = {
      _id: user._id,
      email: user.email,
      role,
      ...(user.superAdminId && { superAdminId: user.superAdminId }), 
    };

    // Log the payload for debugging
    console.log('JWT Payload:', payload);

    // Generate JWT token
    const token = JWT.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });

    // Return user data with the token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.name || user.email, 
        email: user.email,
        role,
        phone: user.phone || null,
        profilePhoto: user.profilePhoto || null,
        ...additionalData, // Include additional fields like `superAdminId`
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
    });
  }
};








// ***********************FORGOT PASSWORD****************************

//FORGOT PASSOWRD CONTROLLER
const nodemailer = require('nodemailer');
const tempUserStore = new Map(); 

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
    console.error(error); 
    return res.status(500).json({ success: false, message: 'Internal server error' });
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













