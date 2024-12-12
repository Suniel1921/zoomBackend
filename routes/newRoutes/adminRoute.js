const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/adminController');


router.post('/createAdmin', controller.createAdmin);
router.get('/getAllAdmin', controller.getAdmins);
router.get('/getAdminById/:id', controller.getAdminById);
router.put('/updateAdmin/:id', controller.updateAdmin);
router.delete('/deleteAdmin/:id', controller.deleteAdmin);





module.exports = router;