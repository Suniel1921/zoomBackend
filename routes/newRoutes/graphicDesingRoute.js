const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/graphicDesingController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.post('/createGraphicDesign', requireLogin, controller.createGraphicDesign);
router.get('/getAllGraphicDesign', requireLogin, controller.getAllGraphicDesign);
router.get('/getGraphicDesignByID/:id', requireLogin, controller.getGraphicDesignById);
router.put('/updateGraphicDesign/:id', requireLogin, controller.updateGraphicDesign);
router.delete('/deleteGraphicDesign/:id', requireLogin, controller.deleteGraphicDesign);






module.exports = router;