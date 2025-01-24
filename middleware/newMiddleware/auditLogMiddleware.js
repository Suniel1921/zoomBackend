

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


const getActionType = (req) => {
  // Check for login paths first
  if (req.path.includes('login')) {
    return 'login';
  }

  // Only map specific HTTP methods to actions
  switch (req.method.toUpperCase()) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return null; // Return null for actions we don't want to log
  }
};

const getUserInfo = (req, res) => {
  // For login attempts, get the attempted username from the request body
  if (req.path.includes('login')) {
    return {
      userName: req.body?.email || req.body?.name || 'unknown',
      userType: 'unknown', // For login attempts, we don't know the user type yet
      userId: null
    };
  }

  // For other actions, get the logged-in user info
  const user = req.user || req.session?.user;
  return {
    userName: user?.name || user?.email || 'unknown',
    userType: user?.role || 'unknown',
    userId: user?._id || null
  };
};

const getIpAddress = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;
  return ip === '::1' ? '127.0.0.1' : ip;
};

const logMiddleware = async (req, res, next) => {
  const originalEnd = res.end;
  const originalJson = res.json;

  // Override res.json to capture status code and response data
  res.json = function(data) {
    res.locals.responseData = data;
    return originalJson.call(this, data);
  };

  // Override res.end
  res.end = async function(chunk, encoding) {
    res.end = originalEnd;

    try {
      const action = getActionType(req);
      
      // Only proceed if it's an action we want to log
      if (action) {
        const ipAddress = getIpAddress(req);
        const statusCode = res.statusCode;

        // Determine if it's a failed login attempt
        const isFailed = action === 'login' && (statusCode === 401 || statusCode === 400);
        const finalAction = isFailed ? 'failed_login' : action;

        // Get user info after determining if it's a failed login
        const { userName, userType, userId } = getUserInfo(req, res);

        // Only log specific actions
        if (['create', 'update', 'delete', 'login', 'failed_login'].includes(finalAction)) {
          const logData = {
            action: finalAction,
            userType,
            userName,
            userId,
            ipAddress,
            timestamp: new Date(),
            details: {
              endpoint: req.originalUrl,
              method: req.method,
              statusCode,
              query: req.query,
              // Include relevant request data
              body: {
                ...(req.body?.email && { email: req.body.email }),
                ...(req.body?.username && { username: req.body.username }),
                ...(finalAction === 'failed_login' && { 
                  reason: res.locals.responseData?.message || 'Authentication failed'
                })
              }
            }
          };

          await AuditLog.create(logData);
        }
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = logMiddleware;