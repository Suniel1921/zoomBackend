const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/graphicDesingController');

router.post('/createGraphicDesign', controller.createGraphicDesign);
router.get('/getAllGraphicDesign', controller.getAllGraphicDesign);
router.get('/getGraphicDesignByID/:id', controller.getGraphicDesignById);
router.put('/updateGraphicDesign/:id', controller.updateGraphicDesign);
router.delete('/deleteGraphicDesign/:id', controller.deleteGraphicDesign);






module.exports = router;