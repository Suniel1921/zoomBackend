// const express = require ("express");
// const router = express.Router();
// const controller = require ("../../controllers/documentTraslationController");



// router.post('/createDocumentTranslation', controller.createDocumentTranslation);
// router.get('/getAllDocumentTranslation', controller.getAllDocumentTranslation);
// router.get('/getDocumentTranslationByID/:id', controller.getDocumentTranslationByID);
// router.put('/udpateDocumentTranslation/:id', controller.updateDocumentTranslation);
// router.delete('/deleteDocumentTranslation/:id', controller.deleteDocumentTranslation);

// module.exports = router;










const express = require("express");
const router = express.Router();
const controller = require("../../controllers/documentTraslationController");
const { requireLogin } = require("../../middleware/newMiddleware/authMiddleware");

// Route Definitions with Authentication Middleware
router.post('/createDocumentTranslation', requireLogin, controller.createDocumentTranslation);
router.get('/getAllDocumentTranslation', requireLogin, controller.getAllDocumentTranslation);
router.get('/getDocumentTranslationByID/:id', requireLogin, controller.getDocumentTranslationByID);
router.put('/udpateDocumentTranslation/:id', requireLogin, controller.updateDocumentTranslation);
router.delete('/deleteDocumentTranslation/:id', requireLogin, controller.deleteDocumentTranslation);

module.exports = router;
