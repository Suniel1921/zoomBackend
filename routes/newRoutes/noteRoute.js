const express = require('express');
const router = express.Router();
const controller = require('../../controllers/noteController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


router.get('/getAllNotes', requireLogin, controller.getNotesBySuperAdmin);
router.get('/getNoteByID/:id', requireLogin, controller.getNoteById);
router.post('/createNote', requireLogin, controller.createNote);
router.put('/updateNote/:id', requireLogin, controller.updateNote);
router.delete('/deleteNote/:id', requireLogin, controller.deleteNote);

module.exports = router;
