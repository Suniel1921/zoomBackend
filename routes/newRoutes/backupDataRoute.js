const express = require ('express');
const router = express.Router();
const controller = require ('../../controllers/backupDataController');


router.get('/backup', controller.createBackup);
router.post('/restore', controller.restoreBackup);
router.get('/schedule', controller.scheduleBackup);






module.exports = router;