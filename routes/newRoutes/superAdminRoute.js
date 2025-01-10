const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/superAdminController');
const { requireLogin, isAdmin } = require('../../middleware/newMiddleware/authMiddleware');
const upload = require('../../config/multerConfig');


//********************super admin route********************
router.post('/createSuperAdmin', controller.CreateSuperAdmin);
router.get('/getAllSuperAdmins', requireLogin, isAdmin, controller.getAllSuperAdmins);
router.delete('/deleteSuperAdmin/:id', requireLogin, isAdmin, controller.deleteSuperAdmin);
// router.put('/updateSuperAdmin/:id', requireLogin, isAdmin, upload.single('superAdminPhoto'), controller.updateSuperAdmin);


// router.post('/uploadSuperAdminPhoto/:id', requireLogin, controller.uploadSuperAdminPhoto);
router.get('/getSuperAdmin/:id', controller.GetSuperAdminById);
router.put('/updateSuperAdmin/:id', upload.single('superAdminPhoto'), controller.updateSuperAdmin);
router.put('/updateSuperAdminPassword/:id', controller.UpdateSuperAdminPassword);





module.exports = router;
