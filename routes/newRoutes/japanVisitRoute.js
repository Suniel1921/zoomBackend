const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/japanVisitController');


router.post('/createJapanVisitApplication', controller.createJapanVisitApplication);
router.get('/getAllJapanVisitApplication', controller.getAllJapanVisitApplications);
// router.get('/getJapanVisitApplicationById/:id', controller.getJapanVisitApplicationById);
// router.put('/updateJapanVisitApplication/:id', controller.updateJapanVisitApplication);
router.delete('/deleteJapanVisitApplication/:id', controller.deleteJapanVisitApplication);



router.get('/getJapanVisitApplicationById/:id', controller.getJapanVisitApplicationById);
router.put('/updateJapanVisitApplication/:id', controller.updateJapanVisitApplication);




module.exports = router;