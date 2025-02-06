

const express = require('express');
const controller = require('../../controllers/auditLogController');
const {requireLogin} = require ('../../middleware/newMiddleware/authMiddleware')

const router = express.Router();

// Protect all audit log routes with authentication and admin access
router.use(requireLogin);


// Audit log routes
router.get('/get-audit-log', controller.getLogs);
router.get('/exports-logs', controller.exportLogs);
router.delete('/clear-all-logs', controller.clearAllLogs);
// router.delete('/clear-old-logs', controller.clearOldLogs);

module.exports = router;