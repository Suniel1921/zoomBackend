const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
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
const callLogsRoute = require ('./routes/newRoutes/callLogsRoute');



dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',  // Local frontend URL
        'https://crm.zoomcreatives.jp',  // Production frontend URL
      ];
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



// Middleware
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'https://crm.zoomcreatives.jp'], // Allow specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Allow credentials (cookies, authentication headers)
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logMiddleware);

// Database Connection
dbConnection();

// Socket.IO - Real-Time Notification Handling
io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected: ', socket.id);
  });
});

// Broadcast new service request notifications
app.use((req, res, next) => {
  req.io = io; // Attach `io` to `req` so it can be used in controllers
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
app.use('/api/v1/callLogs', callLogsRoute);

// Default Route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to the backend server!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});




