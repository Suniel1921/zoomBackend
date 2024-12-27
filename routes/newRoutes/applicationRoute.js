const express = require('express');
const router = express.Router();
const controller = require ("../../controllers/applicationController");
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.post('/createVisaApplication', requireLogin, controller.createApplication);
router.get('/getAllVisaApplication', requireLogin, controller.getApplications);
router.get('/getVisaApplicationById/:id', requireLogin, controller.getApplicationById);
router.put('/updateVisaApplication/:id', requireLogin, controller.updateApplication);
router.delete('/deleteVisaApplication/:id', requireLogin, controller.deleteApplication);


// **file uplaod route**
// router.post('/visa-application-file-Upload/:clientId', controller.allApplicationFileUpload);

  





module.exports = router;
