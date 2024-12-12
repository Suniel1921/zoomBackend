const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/ePassportController');


router.get('/getAllePassports', controller.getAllEpassports);
router.get('/getePassportByID/:id', controller.getEpassportById);
router.post('/createEpassport',controller.createEpassport);
router.put('/updateEpassport/:id', controller.updateEpassport);
router.delete('/deleteEpassport/:id', controller.deleteEpassport);



// **********epassport step update and create route********

router.post('/createEpassportStep', controller.createEPassportStep);
router.put('/updateEpassportStepStatus/:id', controller.updateEpassportStepStatus);


module.exports = router;