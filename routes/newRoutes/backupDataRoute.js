// routes/backupRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/backupDataController');

router.get('/backup-data', controller.handleManualBackup);
router.get('/latest-backup', controller.getLatestBackup);
router.post('/restore', controller.restoreBackup);
router.post('/schedule', controller.scheduleBackup);
router.post('/stop-schedule', controller.stopScheduledBackup);
router.get('/schedule-status', controller.getScheduleStatus);

module.exports = router;