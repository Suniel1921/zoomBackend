// const jwt = require('jsonwebtoken');
// const { User, Client } = require('../models');


// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, ...clientData } = req.body;

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'client'
//     });

//     if (role === 'client') {
//       await Client.create({
//         userId: user.id,
//         ...clientData
//       });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error creating user',
//       error: error.message
//     });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const isValidPassword = await user.validatePassword(password);
//     if (!isValidPassword) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error during login',
//       error: error.message
//     });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const resetToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Send reset password email
//     // Implementation depends on your email service setup

//     res.json({
//       success: true,
//       message: 'Password reset instructions sent to email'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error processing request',
//       error: error.message
//     });
//   }
// };





// ***************************************NEW CODE **************************************

//register controller
const authModel = require("../models/newModel/authModel");
const bcrypt = require('bcryptjs');
const  JWT = require ("jsonwebtoken");
const ClientModel = require("../models/newModel/clientModel");

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




// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email and password are required" });
//     }

//     // Check if user exists
//     const user = await authModel.findOne({ email });
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
//       { _id: user._id, email: user.email, role: user.role },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//       },
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

    // Check if user exists in authModel or clientModel
    let user = await authModel.findOne({ email });
    let isClientModel = false;

    if (!user) {
      user = await ClientModel.findOne({ email });
      isClientModel = true;
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
    // const token = JWT.sign(
    //   { _id: user._id, email: user.email, role: user.role || 'client' }, // Default role for ClientModel
    //   process.env.SECRET_KEY,
    //   { expiresIn: "7d" }
    // );
    const token = JWT.sign(
      { _id: user._id, email: user.email, role: user.role || 'client' }, 
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    )

    // Adjust fullName for ClientModel users
    const fullName = isClientModel ? user.name : user.fullName;

    // return res.status(200).json({success: true, message: "Login successful", user: { fullName,email: user.email, role: user.role || 'client', // Default role for ClientModel
    //   },
    //   token,
    // });


    // Return user details along with the token
return res.status(200).json({
  success: true,
  message: "Login successful",
  user: {
    fullName: isClientModel ? user.name : user.fullName,
    email: user.email,
    role: user.role || 'client',
    id: user._id,  // Include the ID here for frontend usage
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





























// Protected route controller
exports.protectedRoute = async (req, res) => {
  res.status(200).json({ ok: true });
}

// Admin route controller
exports.admin = (req, res) => {
  res.status(200).json({ ok: true });
}
