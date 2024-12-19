const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/adminController');
const {requireLogin} = require ("../../middleware/newMiddleware/authMiddleware");



router.post('/createAdmin',requireLogin, controller.createAdmin);
router.get('/getAllAdmin', requireLogin, controller.getAdmins);
router.get('/getAdminById/:id', requireLogin, controller.getAdminById);
router.put('/updateAdmin/:id', requireLogin, controller.updateAdmin);
router.delete('/deleteAdmin/:id', requireLogin, controller.deleteAdmin);






module.exports = router;