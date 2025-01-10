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






module.exports = router;