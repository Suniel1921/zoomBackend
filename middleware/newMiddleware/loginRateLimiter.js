const rateLimit = require('express-rate-limit');

// Rate limiter for failed login attempts
exports.loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 failed login attempts per windowMs
  message: "Too many failed login attempts. Please try again after 10 minutes.",
  skipSuccessfulRequests: true, // Only count failed requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many failed login attempts. Please try again after 10 minutes.",
    });
  },
});

