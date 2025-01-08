

// const AuditLog = require("../../models/newModel/auditLogModel");

// const logMiddleware = async (req, res, next) => {
//   try {
//     // Only track specific actions
//     const trackableActions = ['POST', 'PUT', 'DELETE', 'LOGIN', 'LOGOUT'];
//     const action = req.method.toLowerCase();

//     if (trackableActions.includes(action.toUpperCase()) || req.path.includes('login') || req.path.includes('logout')) {
//       const logData = {
//         action: req.path.includes('login') 
//           ? (res.statusCode === 401 ? 'login_failed' : 'login') 
//           : req.path.includes('logout') ? 'logout' : action,
//         userType: req.user?.role || 'unknown', // Assumes `req.user` contains logged-in user info
//         userId: req.user?._id || null,
//         ipAddress: req.ip,
//         details: {
//           endpoint: req.originalUrl,
//           query: req.query,
//           body: req.body,
//         },
//       };

//       await AuditLog.create(logData);
//     }
//   } catch (error) {
//     console.error('Failed to log activity:', error);
//   }
  
//   next(); // Proceed to the next middleware
// };

// module.exports = logMiddleware;






const AuditLog = require("../../models/newModel/auditLogModel");

const logMiddleware = async (req, res, next) => {
    try {
      const trackableActions = ['POST', 'PUT', 'DELETE', 'LOGIN', 'LOGOUT'];
      const action = req.method.toLowerCase(); 
  
      // Get the client IP address
      let ipAddress = req.ip; // Default IP
      if (req.headers['x-forwarded-for']) {
        ipAddress = req.headers['x-forwarded-for'].split(',')[0]; // Get the first IP if behind proxies
      }
  
      // If the IP address is "::1" (IPv6 localhost), replace it with "127.0.0.1" (IPv4 localhost)
      if (ipAddress === '::1') {
        ipAddress = '127.0.0.1';
      }
  
      if (trackableActions.includes(action.toUpperCase()) || req.path.includes('login') || req.path.includes('logout')) {
        let logData = {
          action: req.path.includes('login')
            ? (res.statusCode === 401 || res.statusCode === 400 ? 'login_failed' : 'login') // Capture failed login attempts (401 or 400)
            : req.path.includes('logout') ? 'logout' : action,
          userType: req.user?.role || 'unknown', // Assumes `req.user` contains logged-in user info
          userId: req.user?._id || null,
          ipAddress: ipAddress, // Use the resolved IP address
          details: {
            endpoint: req.originalUrl,
            query: req.query,
            body: {
              email: req.body.email,  // Only include email in the log
            },
          },
        };
  
        await AuditLog.create(logData);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  
    next();  // Proceed to the next middleware
  };
  
  module.exports = logMiddleware;
  