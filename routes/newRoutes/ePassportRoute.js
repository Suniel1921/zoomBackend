const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/ePassportController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


router.get('/getAllePassports', requireLogin, controller.getAllEpassports);
router.get('/getePassportByID/:id',  requireLogin, controller.getEpassportById);
router.post('/createEpassport', requireLogin, controller.createEpassport);
router.put('/updateEpassport/:id',  requireLogin, controller.updateEpassport);
router.delete('/deleteEpassport/:id',  requireLogin, controller.deleteEpassport);



// **********epassport step update and create route********

// router.post('/createEpassportStep', controller.createEPassportStep);
// router.put('/updateEpassportStepStatus/:id', controller.updateEpassportStepStatus);


module.exports = router;