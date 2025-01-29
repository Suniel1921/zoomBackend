const express = require('express');
const router = express.Router();
const controller = require ('../../controllers/campaignController');

router.get('/getCategories', controller.getCategories);
router.post('/sendEmailByCategory', controller.sendEmailByCategory);
router.get('/getPastCampaigns', controller.getPastCampaigns);

module.exports = router;