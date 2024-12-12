const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/appointmentController');



router.post('/createAppointment', controller.createAppointment);
router.get('/getAllAppointment', controller.getAllAppointments);
router.get('/getAllAppointmentByID/:id', controller.getAppointmentById);
router.put('/updateAppointment/:id', controller.updateAppointment);
router.put('/updateappointmentStatus/:id/status', controller.updateAppointmentStatus);
router.delete('/deleteAppointment/:id', controller.deleteAppointment);


// **********GET ALL MODEL DATA AT ONCE FOR (ACCOUNT AND TAKS (FRONTEND))**********
router.get('/fetchAllModelData', controller.fetchAllModelData);
router.get('/getAllModelDataByID/:id', controller.getAllModelDataById);
router.post('/createSteps', controller.createApplicationStep);
router.get('/getApplicationStep', controller.getApplicationSteps);
// router.put('/updateStatus/:id', controller.updateStepStatus);
router.put('/updateStatus', controller.updateStepStatus);


module.exports = router;