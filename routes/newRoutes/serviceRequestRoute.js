const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/serviceRequestController');

router.post('/createServiceRequest', controller.createServiceRequest);
router.get('/getAllRequestedService', controller.getAllServiceRequests);
router.get('/getRequestedServiceByID/:id', controller.getServiceRequestById);
router.put('/updateRequestedSerices/:id', controller.updateServiceRequestStatus);
router.delete('/deleteRequestedService/:id', controller.deleteServiceRequest);



module.exports = router; 


