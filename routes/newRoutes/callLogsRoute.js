
// const express = require('express');
// const router = express.Router();
// const controller = require ('../../controllers/callLogsController');
// const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');



// // Routes
// router.post('/create-callLogs', requireLogin, controller.createCallLogs);
// router.get('/get-all-call-logs', requireLogin, controller.getAllCallLogs);
// router.put('/update-CallLogs/:id', requireLogin, controller.updateCallLog);
// router.delete('/delete-callLogs/:id', requireLogin, controller.deleteCallLog);

// module.exports = router;















const express = require('express');
const router = express.Router();
const controller = require('../../controllers/callLogsController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

// Routes
router.post('/create-callLogs', requireLogin, controller.createCallLogs);
router.get('/get-all-call-logs', requireLogin, controller.getAllCallLogs);
router.put('/update-CallLogs/:id', requireLogin, controller.updateCallLog);
router.delete('/delete-callLogs/:id', requireLogin, controller.deleteCallLog);
router.put('/update-notes/:id', requireLogin, controller.updateNotes);

module.exports = router;