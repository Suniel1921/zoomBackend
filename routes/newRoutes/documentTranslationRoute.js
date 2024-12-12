const express = require ("express");
const router = express.Router();
const controller = require ("../../controllers/documentTraslationController");



router.post('/createDocumentTranslation', controller.createDocumentTranslation);
router.get('/getAllDocumentTranslation', controller.getAllDocumentTranslation);
router.get('/getDocumentTranslationByID/:id', controller.getDocumentTranslationByID);
router.put('/udpateDocumentTranslation/:id', controller.updateDocumentTranslation);
router.delete('/deleteDocumentTranslation/:id', controller.deleteDocumentTranslation);

module.exports = router;