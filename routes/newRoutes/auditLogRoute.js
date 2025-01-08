// routes/auditLogRoutes.js
const express = require('express');
const controller = require ('../../controllers/auditLogController');
const router = express.Router();




// router.post('/create-log', controller.addLog);
router.get('/get-audit-log', controller.getLogs);
router.get('/exports-logs', controller.exportLogs);
router.delete('/clear-all-logs', controller.clearAllLogs);
router.delete('/clear-old-logs', controller.clearOldLogs);







module.exports = router;
