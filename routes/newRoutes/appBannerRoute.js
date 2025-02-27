const express = require('express');
const upload = require('../../config/multerConfig');
const router = express.Router();
const controller = require ('../../controllers/appBannerController');


router.post('/uploadAppBanner', upload.single('image'), controller.createBanner);
router.get('/getAppBanner', controller.getBanners); 
router.delete('/deleteAppBanner/:id', controller.deleteBanner);

module.exports = router;