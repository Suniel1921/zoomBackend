
const JWT = require('jsonwebtoken');
const authModel = require('../../models/newModel/authModel');
const SuperAdminModel = require('../../models/newModel/superAdminModel');
const AdminModel = require ('../../models/newModel/adminModel');


exports.requireLogin = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Login First' });
  }

  try {
    const tokenWithoutBearer = token.replace("Bearer ", "").trim();

    if (!tokenWithoutBearer) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
    }

    const decoded = JWT.verify(tokenWithoutBearer, process.env.SECRET_KEY);
    req.user = decoded; // Attach the decoded user info to the request object
    
    // Log the decoded token
    // console.log('Decoded Token:', decoded);

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Token' });
  }
};





//isAdmin and super admin check middleware



exports.isAdmin = async (req, res, next) => {
  try {
    // Ensure that `req.user` exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid User Data' });
    }

    const userId = req.user._id;

    // Check role in each model sequentially
    let role = null;

    // Check Auth Model
    const authUser = await authModel.findById(userId).select('role');
    if (authUser) {
      role = authUser.role;
    }

    // Check Admin Model if not found in Auth Model
    if (!role) {
      const adminUser = await AdminModel.findById(userId).select('role');
      if (adminUser) {
        role = adminUser.role;
      }
    }

    // Check SuperAdmin Model if not found in Admin Model
    if (!role) {
      const superAdminUser = await SuperAdminModel.findById(userId).select('role');
      if (superAdminUser) {
        role = superAdminUser.role;
      }
    }

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
