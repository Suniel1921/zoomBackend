const authModel = require("../models/newModel/authModel");
const bcrypt = require('bcryptjs');
const  JWT = require ("jsonwebtoken");
const ClientModel = require("../models/newModel/clientModel");
const SuperAdminModel = require("../models/newModel/superAdminModel");
const nodemailer = require('nodemailer');
const AdminModel = require("../models/newModel/adminModel");
const AuditLogController = require('../controllers/auditLogController'); 


exports.register = async (req, res) => {
  try {
    const { fullName, phone, nationality, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !phone  || !email || !password || !confirmPassword) {
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




// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Email and password are required" });
//     }

//     // List of models to check, in order of precedence
//     const models = [
//       { model: SuperAdminModel, role: "superadmin", include: {} },
//       { model: AdminModel, role: "admin", include: { superAdminId: 1 } },
//       { model: ClientModel, role: "client", include: { superAdminId: 1 } },
//       { model: authModel, role: "user", include: {} }, 
//     ];

//     let user = null;
//     let role = null;
//     let additionalData = {};

//     // Check each model for the user
//     for (const { model, role: modelRole, include } of models) {
//       user = await model.findOne({ email }).select({ ...include, password: 1, name: 1, email: 1, phone: 1, profilePhoto: 1 });
//       if (user) {
//         role = modelRole;
//         additionalData = include;
//         break;
//       }
//     }

//     if (!user) {
//       // Log failed login attempt (user not found)
//       await AuditLogController.addLog(
//         "failed_login", // Action
//         "unknown",      // User type (unknown since user doesn't exist)
//         null,           // User ID
//         email,          // Use email as the identifier
//         req.ip,         // IP address
//         { message: "User not found" } // Additional details
//       );

//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       // Log failed login attempt (invalid password)
//       await AuditLogController.addLog(
//         "failed_login", // Action
//         role,           // User type (e.g., admin, superadmin, etc.)
//         user._id,       // User ID
//         user.name || user.email, // User name or email
//         req.ip,         // IP address
//         { message: "Invalid password" } // Additional details
//       );

//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     // Update last login time for admin
//     if (role === 'admin') {
//       console.log(`Updating last login for admin: ${user._id}`);
//       await AdminModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
//       console.log(`Last login updated for admin: ${user._id}`);
//     }

//     // Log successful login
//     await AuditLogController.addLog(
//       "login",          // Action
//       role,             // User type (e.g., admin, superadmin, etc.)
//       user._id,         // User ID
//       user.name || user.email, // User name or email
//       req.ip,           // IP address
//       { message: "Login successful" } // Additional details
//     );

//     // Prepare JWT payload
//     const payload = {
//       _id: user._id,
//       email: user.email,
//       role,
//       ...(user.superAdminId && { superAdminId: user.superAdminId }), 
//     };

//     // Log the payload for debugging
//     console.log('JWT Payload:', payload);

//     // Generate JWT token
//     const token = JWT.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });

//     // Return user data with the token
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user._id,
//         fullName: user.name || user.email, 
//         email: user.email,
//         role,
//         phone: user.phone || null,
//         profilePhoto: user.profilePhoto || null,
//         ...additionalData, // Include additional fields like `superAdminId`
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);

//     // Log the error
//     await AuditLogController.addLog(
//       "error",          // Action
//       "system",         // User type (system error)
//       null,             // User ID
//       "Login Controller", // Identifier
//       req.ip,           // IP address
//       { error: error.message } // Additional details
//     );

//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during login. Please try again later.",
//     });
//   }
// };









// from this controller removed ip address for app (apple reject due to tracking ip aderss )

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // List of models to check, in order of precedence
    const models = [
      { model: SuperAdminModel, role: "superadmin", include: {}, checkStatus: false }, // Superadmin doesn't need status check here
      { model: AdminModel, role: "admin", include: { superAdminId: 1, status: 1 }, checkStatus: true }, // Include status and enable check
      { model: ClientModel, role: "client", include: { superAdminId: 1, status: 1 }, checkStatus: true }, // Include status and enable check
      { model: authModel, role: "user", include: {}, checkStatus: false }, // Basic user doesn't need status check here
    ];

    let user = null;
    let role = null;
    let checkStatusFlag = false;
    let additionalData = {};

    // Check each model for the user
    for (const { model, role: modelRole, include, checkStatus } of models) {
      // Include password, name, email, phone, profilePhoto, and status if needed
      const selectFields = {
          ...include,
          password: 1,
          name: 1,
          email: 1,
          phone: 1,
          profilePhoto: 1,
          ...(checkStatus && { status: 1 }) // Conditionally include status field
      };
      user = await model.findOne({ email }).select(selectFields);

      if (user) {
        role = modelRole;
        checkStatusFlag = checkStatus; // Store if this role needs status check
        // Remove status from additionalData if it was included only for the check
        const dataToKeep = { ...include };
        delete dataToKeep.status;
        additionalData = dataToKeep;
        break;
      }
    }

    if (!user) {
      // Log failed login attempt (user not found)
      await AuditLogController.addLog(
        "failed_login", // Action
        "unknown",      // User type (unknown since user doesn't exist)
        null,           // User ID
        email,          // Use email as the identifier
        null,           // IP address removed
        { message: "User not found" } // Additional details
      );
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // --- STATUS CHECK ---
    // Check status only for roles where checkStatusFlag is true (admin, client)
    if (checkStatusFlag && user.status !== 'active') {
       // Log failed login attempt (inactive account)
       await AuditLogController.addLog(
          "failed_login", // Action
          role,           // User type (e.g., admin, client)
          user._id,       // User ID
          user.name || user.email, // User name or email
          null,           // IP address removed
          { message: "Account inactive" } // Additional details
        );
       console.log(`Login attempt failed: Account inactive for ${role} ${user.email}`);
       return res.status(403).json({ // Use 403 Forbidden for inactive accounts
         success: false,
         message: "Your account is currently inactive. Please contact the administrator for assistance."
       });
    }
    // --- END STATUS CHECK ---


    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt (invalid password)
      await AuditLogController.addLog(
        "failed_login", // Action
        role,           // User type (e.g., admin, superadmin, etc.)
        user._id,       // User ID
        user.name || user.email, // User name or email
        null,           // IP address removed
        { message: "Invalid password" } // Additional details
      );
      console.log(`Login attempt failed: Invalid password for ${role} ${user.email}`);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Update last login time only for active admin and client logins
    // (Superadmin lastLogin seems to be handled differently or not tracked here)
    if (role === 'admin') {
        console.log(`Updating last login for admin: ${user._id}`);
        // Use await here to ensure it completes before proceeding
        await AdminModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        console.log(`Last login updated for admin: ${user._id}`);
    }
    // Add similar logic for ClientModel if you track their last login
    // if (role === 'client') {
    //     await ClientModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    // }


    // Log successful login
    await AuditLogController.addLog(
      "login",          // Action
      role,             // User type (e.g., admin, superadmin, etc.)
      user._id,         // User ID
      user.name || user.email, // User name or email
      null,             // IP address removed
      { message: "Login successful" } // Additional details
    );

    // Prepare JWT payload
    const payload = {
      _id: user._id,
      email: user.email,
      role,
      ...(user.superAdminId && { superAdminId: user.superAdminId.toString() }), // Ensure superAdminId is string if needed
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
        // Use 'name' field if available, fallback to email
        fullName: user.name || user.email,
        email: user.email,
        role,
        phone: user.phone || null, // Include phone if available
        profilePhoto: user.profilePhoto || user.superAdminPhoto || null, // Include profile photo or superAdminPhoto
        // Include superAdminId only if it exists in the payload (for admin/client)
        ...(payload.superAdminId && { superAdminId: payload.superAdminId }),
        // You might not want to send back the status explicitly unless needed by the frontend
        // status: user.status // Only include if necessary
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);

    // Log the error
    await AuditLogController.addLog(
      "error",          // Action
      "system",         // User type (system error)
      null,             // User ID
      "Login Controller", // Identifier
      null,             // IP address removed
      { error: error.message, stack: error.stack } // Include stack trace for debugging
    );

    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined // Show error details only in development
    });
  }
};















// Fetch logged-in user details  (for mobile app account page)
exports.loggedIndUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let user = null;

    if (role === "superadmin") user = await SuperAdminModel.findById(userId).select("name email phone profilePhoto");
    else if (role === "admin") user = await AdminModel.findById(userId).select("name email phone profilePhoto");
    else if (role === "client") user = await ClientModel.findById(userId).select("name email phone profilePhoto");
    else user = await authModel.findById(userId).select("name email phone profilePhoto");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}




// ***********************FORGOT PASSWORD****************************

//FORGOT PASSOWRD CONTROLLER


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







// Add this to your controller
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const storedData = tempUserStore.get(email);
    
    if (!storedData || 
        storedData.otp !== otp || 
        Date.now() - storedData.createdAt > 600000) { // 10 minutes
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
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




// alert (below code is not working on web crm but work on app)



// ***********testing for app with proper validation using express validator****************

// const { body, validationResult } = require('express-validator');
// const authModel = require("../models/newModel/authModel");
// const bcrypt = require('bcryptjs');
// const JWT = require("jsonwebtoken");
// const ClientModel = require("../models/newModel/clientModel");
// const SuperAdminModel = require("../models/newModel/superAdminModel");
// const nodemailer = require('nodemailer');
// const AdminModel = require("../models/newModel/adminModel");
// const AuditLogController = require('../controllers/auditLogController');

// const tempUserStore = new Map();

// // Validation middleware for register
// const validateRegister = [
//   body('fullName').trim().notEmpty().withMessage('Full name is required'),
//   body('phone').trim().notEmpty().withMessage('Phone number is required'),
//   body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
//   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
//   body('confirmPassword')
//     .custom((value, { req }) => value === req.body.password)
//     .withMessage('Passwords do not match'),
// ];

// // Validation middleware for login
// const validateLogin = [
//   body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
//   body('password').notEmpty().withMessage('Password is required'),
// ];

// // Validation middleware for forgot password
// const validateForgotPassword = [
//   body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
// ];

// // Validation middleware for reset password
// const validateResetPassword = [
//   body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
//   body('otp').isNumeric().withMessage('OTP must be a number'),
//   body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
// ];

// // Validation middleware for verify OTP
// const validateVerifyOTP = [
//   body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
//   body('otp').isNumeric().withMessage('OTP must be a number'),
// ];

// exports.register = [
//   validateRegister,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: errors.array()[0].msg });
//       }

//       const { fullName, phone, nationality, email, password } = req.body;

//       // Check if user already exists
//       const userExists = await authModel.findOne({ email });
//       if (userExists) {
//         return res.status(409).json({ success: false, message: 'User already exists' });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Save new user
//       const newUser = await authModel.create({
//         fullName,
//         phone,
//         nationality,
//         email,
//         password: hashedPassword,
//       });

//       return res.status(201).json({
//         success: true,
//         message: 'Account created successfully! Please log in.',
//         user: {
//           id: newUser._id,
//           fullName: newUser.fullName,
//           email: newUser.email,
//           phone: newUser.phone,
//         },
//       });
//     } catch (error) {
//       console.error('Register Error:', error);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   },
// ];

// exports.login = [
//   validateLogin,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: errors.array()[0].msg });
//       }

//       const { email, password } = req.body;

//       // List of models to check
//       const models = [
//         { model: SuperAdminModel, role: "superadmin", include: {} },
//         { model: AdminModel, role: "admin", include: { superAdminId: 1 } },
//         { model: ClientModel, role: "client", include: { superAdminId: 1 } },
//         { model: authModel, role: "user", include: {} },
//       ];

//       let user = null;
//       let role = null;
//       let additionalData = {};

//       // Check each model for the user
//       for (const { model, role: modelRole, include } of models) {
//         user = await model
//           .findOne({ email })
//           .select({ ...include, password: 1, name: 1, email: 1, phone: 1, profilePhoto: 1 });
//         if (user) {
//           role = modelRole;
//           additionalData = include;
//           break;
//         }
//       }

//       if (!user) {
//         await AuditLogController.addLog(
//           "failed_login",
//           "unknown",
//           null,
//           email,
//           null,
//           { message: "User not found" }
//         );
//         return res.status(401).json({ success: false, message: "Invalid email or password" });
//       }

//       // Verify password
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         await AuditLogController.addLog(
//           "failed_login",
//           role,
//           user._id,
//           user.name || user.email,
//           null,
//           { message: "Invalid password" }
//         );
//         return res.status(401).json({ success: false, message: "Invalid email or password" });
//       }

//       // Update last login time for admin
//       if (role === 'admin') {
//         await AdminModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
//       }

//       // Log successful login
//       await AuditLogController.addLog(
//         "login",
//         role,
//         user._id,
//         user.name || user.email,
//         null,
//         { message: "Login successful" }
//       );

//       // Prepare JWT payload
//       const payload = {
//         _id: user._id,
//         email: user.email,
//         role,
//         ...(user.superAdminId && { superAdminId: user.superAdminId }),
//       };

//       // Generate JWT token
//       const token = JWT.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });

//       return res.status(200).json({
//         success: true,
//         message: "Login successful",
//         user: {
//           id: user._id,
//           fullName: user.name || user.email,
//           email: user.email,
//           role,
//           phone: user.phone || null,
//           profilePhoto: user.profilePhoto || null,
//           ...additionalData,
//         },
//         token,
//       });
//     } catch (error) {
//       console.error("Login Error:", error);
//       await AuditLogController.addLog(
//         "error",
//         "system",
//         null,
//         "Login Controller",
//         null,
//         { error: error.message }
//       );
//       return res.status(500).json({
//         success: false,
//         message: "An error occurred during login. Please try again later.",
//       });
//     }
//   },
// ];

// exports.loggedIndUserData = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const role = req.user.role;

//     let user = null;

//     if (role === "superadmin") user = await SuperAdminModel.findById(userId).select("name email phone profilePhoto");
//     else if (role === "admin") user = await AdminModel.findById(userId).select("name email phone profilePhoto");
//     else if (role === "client") user = await ClientModel.findById(userId).select("name email phone profilePhoto");
//     else user = await authModel.findById(userId).select("fullName email phone profilePhoto");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         fullName: user.name || user.fullName || user.email,
//         email: user.email,
//         phone: user.phone || null,
//         profilePhoto: user.profilePhoto || null,
//       },
//     });
//   } catch (error) {
//     console.error("Fetch User Error:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// exports.forgotPassword = [
//   validateForgotPassword,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: errors.array()[0].msg });
//       }

//       const { email } = req.body;

//       let user = await ClientModel.findOne({ email });
//       if (!user) user = await SuperAdminModel.findOne({ email });
//       if (!user) user = await AdminModel.findOne({ email });

//       if (!user) {
//         return res.status(404).json({ success: false, message: 'User does not exist' });
//       }

//       const otp = Math.floor(100000 + Math.random() * 900000);
//       tempUserStore.set(email, { otp, createdAt: Date.now() });

//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.MYEMAIL,
//           pass: process.env.PASSWORD,
//         },
//       });

//       const mailOptions = {
//         from: process.env.MYEMAIL,
//         to: email,
//         subject: 'Password Reset OTP - ZoomCreatives',
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <div style="text-align: center; margin-bottom: 20px;">
//             </div>
//             <p>Hello User,</p>
//             <p>We received a request to reset the password for your ZoomCreatives account. If you did not request a password reset, please ignore this email.</p>
//             <p>To reset your password, please use the following One-Time Password (OTP):</p>
//             <p style="font-size: 18px; font-weight: bold; color: #3d82c5;">${otp}</p>
//             <p>This code is valid for 10 minutes. Simply enter this code on the password reset page to create a new password for your account.</p>
//             <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
//             <p>Best regards,<br/>The ZoomCreatives Team</p>
//           </div>
//         `,
//       };

//       await transporter.sendMail(mailOptions);

//       return res.status(200).json({ success: true, message: 'OTP sent to email. Please verify to reset password.' });
//     } catch (error) {
//       console.error("Forgot Password Error:", error);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   },
// ];

// exports.verifyOTP = [
//   validateVerifyOTP,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: errors.array()[0].msg });
//       }

//       const { email, otp } = req.body;

//       const storedData = tempUserStore.get(email);

//       if (!storedData || storedData.otp !== parseInt(otp) || Date.now() - storedData.createdAt > 600000) {
//         return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'OTP verified successfully',
//       });
//     } catch (error) {
//       console.error("Verify OTP Error:", error);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   },
// ];

// exports.resetPassword = [
//   validateResetPassword,
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ success: false, message: errors.array()[0].msg });
//       }

//       const { email, otp, newPassword } = req.body;

//       const storedData = tempUserStore.get(email);
//       if (!storedData || storedData.otp !== parseInt(otp) || Date.now() - storedData.createdAt > 600000) {
//         return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//       }

//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       let user = await ClientModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
//       if (!user) user = await SuperAdminModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
//       if (!user) user = await AdminModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

//       if (!user) {
//         return res.status(404).json({ success: false, message: 'User not found' });
//       }

//       tempUserStore.delete(email);

//       const token = JWT.sign(
//         { _id: user._id, email: user.email, role: user.role },
//         process.env.SECRET_KEY,
//         { expiresIn: "7d" }
//       );

//       return res.status(200).json({
//         success: true,
//         message: 'Password reset successful.',
//         token,
//       });
//     } catch (error) {
//       console.error("Reset Password Error:", error);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   },
// ];

// exports.protectedRoute = async (req, res) => {
//   return res.status(200).json({ success: true, message: "Protected route accessed successfully" });
// };

// exports.admin = (req, res) => {
//   return res.status(200).json({ success: true, message: "Admin route accessed successfully" });
// };














