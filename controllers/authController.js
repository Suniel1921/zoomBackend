
//register controller
const authModel = require("../models/newModel/authModel");
const bcrypt = require('bcryptjs');
const  JWT = require ("jsonwebtoken");
const ClientModel = require("../models/newModel/clientModel");
const SuperAdminModel = require("../models/newModel/superAdminModel");

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

    // Adjust fullName based on model type
    const fullName = isClientModel ? user.name : (isSuperAdminModel ? user.email : user.fullName);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    
      user: {
              id: user._id,
              fullName, 
              email: user.email,
              role: user.role || 'client', 
              phone: user.phone
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

































// Protected route controller
exports.protectedRoute = async (req, res) => {
  res.status(200).json({ ok: true });
}

// Admin route controller
exports.admin = (req, res) => {
  res.status(200).json({ ok: true });
}
