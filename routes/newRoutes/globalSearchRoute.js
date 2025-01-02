const express = require ('express');
const router = express.Router();
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');
const controller = require ('../../controllers/globalSearchController');



// ********global search*******

router.get('/globalSearch', requireLogin, controller.globalSearch);



module.exports = router;