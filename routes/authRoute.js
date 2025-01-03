// const express = require('express');
// const router = express.Router();
// const { authLimiter } = require('../middleware/rateLimiter');
// const authController = require('../controllers/authController');

// // Apply rate limiting to auth routes
// router.use(authLimiter);

// // Auth routes
// // router.post('/register', authController.register);
// // router.post('/login', authController.login);
// // router.post('/forgot-password', authController.forgotPassword);
// // router.post('/reset-password', authController.resetPassword);
// // router.post('/refresh-token', authController.refreshToken);
// // router.post('/logout', authController.logout);

// module.exports = router;




// ****************NEW CODE*******************

const express = require ("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { requireLogin, isAdmin } = require("../middleware/newMiddleware/authMiddleware");
const upload = require('../config/multerConfig');


router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/protectedRoute', requireLogin, controller.protectedRoute);
router.get('/admin', requireLogin, isAdmin, controller.admin);


// *************************forgot password and reset link*************************
router.post('/forgotPassword', controller.forgotPassword);
router.post('/resetPassword', controller.resetPassword);




//********************super admin route********************
router.post('/createSuperAdmin', controller.CreateSuperAdmin);
router.get('/getAllSuperAdmins', controller.getAllSuperAdmins);
// router.post('/uploadSuperAdminPhoto/:id', requireLogin, controller.uploadSuperAdminPhoto);
router.get('/getSuperAdmin/:id', controller.GetSuperAdminById);
router.put('/updateSuperAdmin/:id', upload.single('superAdminPhoto'), controller.updateSuperAdmin);
router.put('/updateSuperAdminPassword/:id', controller.UpdateSuperAdminPassword);






module.exports = router;