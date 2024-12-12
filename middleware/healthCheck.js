const healthCheckMiddleware = (req, res, next) => {
  if (req.path === '/health') {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };
    
    try {
      res.send(healthcheck);
    } catch (error) {
      healthcheck.message = error;
      res.status(503).send();
    }
  } else {
    next();
  }
};

module.exports = healthCheckMiddleware;