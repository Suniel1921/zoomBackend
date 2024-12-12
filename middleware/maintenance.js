const maintenanceMiddleware = (req, res, next) => {
  // Check if maintenance mode is enabled
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow health check endpoint
    if (req.path === '/health') {
      return next();
    }

    // Return maintenance mode response
    return res.status(503).json({
      success: false,
      message: 'System is under maintenance. Please try again later.',
      estimatedDowntime: process.env.MAINTENANCE_DURATION || '1 hour'
    });
  }

  next();
};

module.exports = maintenanceMiddleware;