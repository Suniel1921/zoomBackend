const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/japanVisitController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


router.post('/createJapanVisitApplication', requireLogin, controller.createJapanVisitApplication);
router.get('/getAllJapanVisitApplication', requireLogin, controller.getAllJapanVisitApplications);
// router.get('/getJapanVisitApplicationById/:id', controller.getJapanVisitApplicationById);
// router.put('/updateJapanVisitApplication/:id', controller.updateJapanVisitApplication);
router.delete('/deleteJapanVisitApplication/:id', requireLogin, controller.deleteJapanVisitApplication);



router.get('/getJapanVisitApplicationById/:id', requireLogin, controller.getJapanVisitApplicationById);
router.put('/updateJapanVisitApplication/:id', requireLogin, controller.updateJapanVisitApplication);




module.exports = router;