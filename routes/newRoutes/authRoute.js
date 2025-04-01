// ****************NEW CODE*******************

const express = require ("express");
const router = express.Router();
const controller = require("../../controllers/authController");
const { requireLogin, isAdmin } = require("../../middleware/newMiddleware/authMiddleware");
const upload = require('../../config/multerConfig');
const { loginRateLimiter } = require("../../middleware/newMiddleware/loginRateLimiter");


router.post('/register', controller.register);
// router.post('/login', loginRateLimiter, controller.login);
router.post('/login', controller.login); //without rate limit route
router.get('/getLoggedInUser', requireLogin, controller.loggedIndUserData);
router.get('/protectedRoute', requireLogin, controller.protectedRoute);
router.get('/admin', requireLogin, isAdmin, controller.admin);


// *************************forgot password and reset link*************************
router.post('/forgotPassword', controller.forgotPassword);
router.post('/resetPassword', controller.resetPassword);
router.post('/verifyOTP', controller.verifyOTP); // This route is for mobile app to verify OTP


module.exports = router;



