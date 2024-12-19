const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/otherServicesController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


router.post('/createOtherServices',requireLogin, controller.createOtherServices);
router.get('/getAllOtherServices', requireLogin, controller.getAllOtherServices);
router.get('/getOtherServicesByID/:id', requireLogin, controller.getOtherServicesByID);
router.put('/updateOtherServices/:id', requireLogin, controller.updateOtherServices);
router.delete('/deleteOtherServices/:id', requireLogin, controller.deleteOtherServices);


module.exports = router;