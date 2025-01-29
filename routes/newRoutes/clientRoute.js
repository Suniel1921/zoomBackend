const express = require('express');
const router = express.Router();
const controller = require ('../../controllers/clientController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');


// Get all clients
router.get('/getClient', requireLogin, controller.getClients);
//get single client by id
router.get('/getClient/:id', requireLogin, controller.getClientById);
//create / add client
router.post('/createClient', requireLogin, controller.addClient);
//udpate client
router.put('/updateClient/:id', requireLogin, controller.updateClient);
//update client profile
router.put('/updateClientProfile/:id', requireLogin, controller.updateClientProfile);
//delete client
router.delete('/deleteClient/:id', requireLogin, controller.deleteClient);


router.post('/uploadCsvFile', requireLogin, controller.uploadCSVFile);


// New route to fetch categories and sending email 
// router.get('/getCategories', controller.getCategories);
// router.post('/sendEmailByCategory', controller.sendEmailByCategory);



module.exports = router;







