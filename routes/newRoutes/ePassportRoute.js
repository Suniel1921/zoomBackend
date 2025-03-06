const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/ePassportController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


router.get('/getAllePassports', requireLogin, controller.getAllEpassports);
router.get('/getePassportByID/:id',  requireLogin, controller.getEpassportById);
router.post('/createEpassport', requireLogin, controller.createEpassport);
router.put('/updateEpassport/:id',  requireLogin, controller.updateEpassport);
router.delete('/deleteEpassport/:id',  requireLogin, controller.deleteEpassport);

// **file upload route**
router.post('/uploadMultipleFiles/:clientId', requireLogin, controller.uploadFileForApplication);

// *****file upload route for all mode based on model name (this api route called in FileTab component)****
router.post('/fileUpload/:clientId/:modelName', controller.allApplicationFileUpload);
// router.delete('/deleteClientFile/:clientId/:modelName/:fileUrl', controller.deleteClientFile);
router.delete('/deleteFile', controller.deleteFile);



module.exports = router;