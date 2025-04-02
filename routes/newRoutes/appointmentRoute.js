const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/appointmentController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');



router.post('/createAppointment', requireLogin, controller.createAppointment);
router.get('/getAllAppointment', requireLogin, controller.getAllAppointments);
router.get('/getAllAppointmentByID/:clientId', requireLogin, controller.getAppointmentsByClientId);
router.put('/updateAppointment/:id', requireLogin, controller.updateAppointment);
router.put('/updateappointmentStatus/:id/status', requireLogin, controller.updateAppointmentStatus);
router.delete('/deleteAppointment/:id', requireLogin, controller.deleteAppointment);












// **********GET ALL MODEL DATA AT ONCE FOR (ACCOUNT AND TAKS (FRONTEND))**********
router.get('/fetchAllModelData', requireLogin, controller.fetchAllModelData);
router.get('/getAllModelDataByID/:id', controller.getAllModelDataById);

// router.post('/createSteps', controller.createApplicationStep);
// router.get('/getApplicationStep', controller.getApplicationSteps);
// router.put('/updateStatus/:id', controller.updateStepStatus);
router.put('/updateStatus', controller.updateStepStatus);






module.exports = router;