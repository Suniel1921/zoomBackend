
const JWT = require('jsonwebtoken');
const authModel = require('../../models/newModel/authModel');
const SuperAdminModel = require('../../models/newModel/superAdminModel');



// exports.requireLogin = async (req, res, next) => {
//   const token = req.header('Authorization');

//   // console.log('Authorization Header:', token);  // Log the token here

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Unauthorized: Login First' });
//   }

//   try {
//     // Remove "Bearer " and trim whitespace
//     const decoded = JWT.verify(token.replace("Bearer ", "").trim(), process.env.SECRET_KEY);
//     req.user = decoded; 
//     // console.log('Decoded Token:', decoded);  // Log the decoded token
//     next();  
//   } catch (error) {
//     console.error('Token Verification Error:', error.message);
//     return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
//   }
// };





exports.requireLogin = async (req, res, next) => {
  const token = req.header('Authorization');

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Login First' });
  }

  try {
    // Remove "Bearer " prefix and trim any extra spaces from the token
    const tokenWithoutBearer = token.replace("Bearer ", "").trim();

    // Check if the token is valid
    if (!tokenWithoutBearer) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
    }

    // Verify the token using the secret key
    const decoded = JWT.verify(tokenWithoutBearer, process.env.SECRET_KEY);

    // Attach the decoded token's user data to the request object
    req.user = decoded;

    // Optionally log the decoded token for debugging
    console.log('Decoded Token:', decoded);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error to help debugging
    console.error('Token Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
  }
};




//isAdmin check middleware

exports.isAdmin = async (req, res, next) => {
  try {
    // Ensure that `req.user` exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid User Data' });
    }

    const userId = req.user._id;

    // Check user role in both models
    const authUser = await authModel.findById(userId).select('role');
    const superAdminUser = !authUser ? await SuperAdminModel.findById(userId).select('role') : null;

    // Determine role from whichever model returned a user
    const role = authUser?.role || superAdminUser?.role;

    // Check if the role is `admin` or `superadmin`
    if (!role || !['admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient Permissions' });
    }

    next(); // User is either `admin` or `superadmin`, proceed to the next step
  } catch (error) {
    console.error('Error in isAdmin middleware:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};




