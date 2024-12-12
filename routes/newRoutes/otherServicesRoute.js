const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/otherServicesController');


router.post('/createOtherServices', controller.createOtherServices);
router.get('/getAllOtherServices', controller.getAllOtherServices);
router.get('/getOtherServicesByID/:id', controller.getOtherServicesByID);
router.put('/updateOtherServices/:id', controller.updateOtherServices);
router.delete('/deleteOtherServices/:id', controller.deleteOtherServices);


module.exports = router;