// // Increase the default max listeners
// require('events').EventEmitter.defaultMaxListeners = 15;

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const { sequelize } = require('./models');
// // const authRoutes = require('./routes/authRoute');
// const clientRoutes = require('./routes/clients');
// const applicationRoutes = require('./routes/applications');
// const appointmentRoutes = require('./routes/appointments');
// const documentRoutes = require('./routes/documents');
// const dbConnection = require('./config/dbConn');

// //new route imported by sunil
// const authRoute = require ('./routes/authRoute');
// const clientRoute = require ('./routes/newRoutes/clientRoute');
// const visaApplicationRoute = require ('./routes/newRoutes/applicationRoute');
// const japanVisitRoute = require ('./routes/newRoutes/japanVisitRoute');
// const documentTranslationRoute = require ('./routes/newRoutes/documentTranslationRoute');
// const ePassportRoute = require ('./routes/newRoutes/ePassportRoute');
// const otherServicesRoute = require ('./routes/newRoutes/otherServicesRoute');
// const graphicDesignRoute = require ('./routes/newRoutes/graphicDesingRoute');
// const appointmentRoute = require ('./routes/newRoutes/appointmentRoute');
// const adminRoute = require ('./routes/newRoutes/adminRoute');
// const superAdminRoute = require ('./routes/newRoutes/superAdminRoute');
// const serviceRequestRoute = require ('./routes/newRoutes/serviceRequestRoute');
// const globalSearchRoute = require ('./routes/newRoutes/globalSearchRoute');
// const noteRoute = require ('./routes/newRoutes/noteRoute');
// const backupDataRoute = require ('./routes/newRoutes/backupDataRoute');
// const auditLogRoute = require ('./routes/newRoutes/auditLogRoute');
// const logMiddleware = require('./middleware/newMiddleware/auditLogMiddleware');


// dotenv.config();

// const app = express();

// // Middleware
// // app.use(cors({
// //   origin: 'http://localhost:5173', // Allow the frontend URL
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// //   credentials: true, // Allow credentials like cookies or authorization headers
// // }));


// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(logMiddleware);

// // Routes
// // app.use('/api/auth', authRoutes);
// app.use('/api/clients', clientRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/documents', documentRoutes);


// // ********NEW ROUTE********
// app.use('/api/v1/auth', authRoute);
// app.use('/api/v1/client', clientRoute);
// app.use('/api/v1/visaApplication', visaApplicationRoute);
// app.use('/api/v1/japanVisit', japanVisitRoute);
// app.use('/api/v1/documentTranslation', documentTranslationRoute);
// app.use('/api/v1/ePassport', ePassportRoute);
// app.use('/api/v1/otherServices', otherServicesRoute);
// app.use('/api/v1/graphicDesign', graphicDesignRoute);
// app.use('/api/v1/appointment', appointmentRoute);
// app.use('/api/v1/admin', adminRoute);
// app.use('/api/v1/superAdmin', superAdminRoute);
// app.use('/api/v1/serviceRequest', serviceRequestRoute);
// app.use('/api/v1/globalSearch', globalSearchRoute);
// app.use('/api/v1/note', noteRoute);
// app.use('/api/v1/backup', backupDataRoute);
// app.use('/api/v1/logs', auditLogRoute);




// //connecting with database
// dbConnection();


// const PORT = process.env.PORT || 3000;



// app.get('/', (req, res) => {
//   res.json({ success: true, message: 'Welcome to zoom backend ' });
// });


// app.listen(PORT,()=> {
//   console.log(`Server is running on no port no : ${PORT}`)
// })








'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
const dbConnection = require('./config/dbConn');
const logMiddleware = require('./middleware/newMiddleware/auditLogMiddleware');

// Import Routes
const authRoute = require('./routes/authRoute');
const clientRoute = require('./routes/newRoutes/clientRoute');
const visaApplicationRoute = require('./routes/newRoutes/applicationRoute');
const japanVisitRoute = require('./routes/newRoutes/japanVisitRoute');
const documentTranslationRoute = require('./routes/newRoutes/documentTranslationRoute');
const ePassportRoute = require('./routes/newRoutes/ePassportRoute');
const otherServicesRoute = require('./routes/newRoutes/otherServicesRoute');
const graphicDesignRoute = require('./routes/newRoutes/graphicDesingRoute');
const appointmentRoute = require('./routes/newRoutes/appointmentRoute');
const adminRoute = require('./routes/newRoutes/adminRoute');
const superAdminRoute = require('./routes/newRoutes/superAdminRoute');
const serviceRequestRoute = require('./routes/newRoutes/serviceRequestRoute');
const globalSearchRoute = require('./routes/newRoutes/globalSearchRoute');
const noteRoute = require('./routes/newRoutes/noteRoute');
const backupDataRoute = require('./routes/newRoutes/backupDataRoute');
const auditLogRoute = require('./routes/newRoutes/auditLogRoute');

dotenv.config();

const app = express();
const server = createServer(app);

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Development URL
  'https://crm.zoomcreatives.jp', // Production URL
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress response bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logMiddleware);

// Database Connection
dbConnection();

// Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
  ],
});

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Real-Time Notification Handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

app.use((req, res, next) => {
  req.io = io; // Attach Socket.IO to the request
  next();
});

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/client', clientRoute);
app.use('/api/v1/visaApplication', visaApplicationRoute);
app.use('/api/v1/japanVisit', japanVisitRoute);
app.use('/api/v1/documentTranslation', documentTranslationRoute);
app.use('/api/v1/ePassport', ePassportRoute);
app.use('/api/v1/otherServices', otherServicesRoute);
app.use('/api/v1/graphicDesign', graphicDesignRoute);
app.use('/api/v1/appointment', appointmentRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/superAdmin', superAdminRoute);
app.use('/api/v1/serviceRequest', serviceRequestRoute);
app.use('/api/v1/globalSearch', globalSearchRoute);
app.use('/api/v1/note', noteRoute);
app.use('/api/v1/backup', backupDataRoute);
app.use('/api/v1/logs', auditLogRoute);

// Default Route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to the backend server!' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Graceful Shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Close database connection if necessary
  // Example: mongoose.connection.close()
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
