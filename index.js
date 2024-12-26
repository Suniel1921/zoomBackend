const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
// const authRoutes = require('./routes/authRoute');
const clientRoutes = require('./routes/clients');
const applicationRoutes = require('./routes/applications');
const appointmentRoutes = require('./routes/appointments');
const documentRoutes = require('./routes/documents');
const dbConnection = require('./config/dbConn');

//new route imported by sunil
const authRoute = require ('./routes/authRoute');
const clientRoute = require ('./routes/newRoutes/clientRoute');
const visaApplicationRoute = require ('./routes/newRoutes/applicationRoute');
const japanVisitRoute = require ('./routes/newRoutes/japanVisitRoute');
const documentTranslationRoute = require ('./routes/newRoutes/documentTranslationRoute');
const ePassportRoute = require ('./routes/newRoutes/ePassportRoute');
const otherServicesRoute = require ('./routes/newRoutes/otherServicesRoute');
const graphicDesignRoute = require ('./routes/newRoutes/graphicDesingRoute');
const appointmentRoute = require ('./routes/newRoutes/appointmentRoute');
const adminRoute = require ('./routes/newRoutes/adminRoute');
const serviceRequestRoute = require ('./routes/newRoutes/serviceRequestRoute');


dotenv.config();

const app = express();

// Middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Allow the frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // Allow credentials like cookies or authorization headers
// }));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);


// ********NEW ROUTE********
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
app.use('/api/v1/serviceRequest', serviceRequestRoute);




//connecting with database
dbConnection();


const PORT = process.env.PORT || 3000;



app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to zoom backend' });
});


app.listen(PORT,()=> {
  console.log(`Server is running on no port no : ${PORT}`)
})



// i have this model and i want to fectch data seperately like if this crm used 10000+ client let take a two client for now ram and shyam make sure when ram login then dont show the shyam data and shyam login then dont show the ram data on her dashbaord 

