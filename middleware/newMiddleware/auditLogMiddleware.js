
const AuditLogController = require('../../controllers/auditLogController');

const auditLogMiddleware = async (req, res, next) => {
  // Skip logging for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const originalSend = res.send;
  let logSent = false;
  
  res.send = function (data) {
    if (!logSent) {
      try {
        // Only parse JSON responses
        const body = typeof data === 'string' && data.startsWith('{') 
          ? JSON.parse(data)
          : null;

        if (body) {
          const ipAddress = 
            req.headers['x-forwarded-for']?.split(',')[0] || 
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip;

          // Handle login attempts
          if (req.path.includes('/login')) {
            const userType = body.user?.role || 'unknown';
            const userId = body.user?.id || null;
            const userName = body.user?.fullName || body.user?.email || req.body.email || 'unknown';
            const action = body.success ? 'login' : 'failed_login';
            
            if (userName && ipAddress) {
              AuditLogController.addLog(
                action,
                userType,
                userId,
                userName,
                ipAddress,
                { 
                  success: body.success,
                  message: body.message || 'Login attempt',
                  path: req.path
                }
              );
              logSent = true;
            }
          }
          // Handle logout
          else if (req.path.includes('/logout') && body.success) {
            const user = req.user || {};
            AuditLogController.addLog(
              'logout',
              user.role || 'unknown',
              user.id,
              user.fullName || user.email || 'unknown',
              ipAddress,
              { message: 'User logged out' }
            );
            logSent = true;
          }
          // Handle other authenticated actions (excluding GET requests)
          else if (body.success && req.user) {
            const action = req.method.toLowerCase();
            AuditLogController.addLog(
              action,
              req.user.role || 'unknown',
              req.user.id,
              req.user.fullName || req.user.email || 'unknown',
              ipAddress,
              { 
                path: req.path,
                method: req.method,
                message: body.message
              }
            );
            logSent = true;
          }
        }
      } catch (error) {
        if (typeof data === 'string' && data.startsWith('{')) {
          console.error('Error in audit log middleware:', error);
        }
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = auditLogMiddleware;