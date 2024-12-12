// /routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require ("../../controllers/applicationController");

router.post('/createVisaApplication', controller.createApplication);
router.get('/getAllVisaApplication', controller.getApplications);
router.get('/getVisaApplicationById/:id', controller.getApplicationById);
router.put('/updateVisaApplication/:id', controller.updateApplication);
router.delete('/deleteVisaApplication/:id', controller.deleteApplication);





module.exports = router;
