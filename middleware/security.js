const helmet = require('helmet');

// Configure security middleware
const securityMiddleware = [
  // Basic security headers
  helmet(),

  // Custom CSP
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  }),

  // Prevent clickjacking
  helmet.frameguard({ action: 'deny' }),

  // Hide X-Powered-By header
  helmet.hidePoweredBy(),

  // Prevent MIME type sniffing
  helmet.noSniff(),

  // Enable XSS filter
  helmet.xssFilter(),

  // Custom security headers
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  },
];

module.exports = securityMiddleware;