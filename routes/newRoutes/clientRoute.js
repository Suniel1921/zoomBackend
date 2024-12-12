const express = require('express');
const router = express.Router();
// const {getClients,getClientById,addClient, updateClient,deleteClient,} = require('../controllers/clientController');
const controller = require ('../../controllers/clientController');


// Get all clients
router.get('/getClient', controller.getClients);
//get single client by id
router.get('/getClient/:id', controller.getClientById);
//create / add client
router.post('/createClient', controller.addClient);
//udpate client
router.put('/updateClient/:id', controller.updateClient);
//delete client
router.delete('/deleteClient/:id', controller.deleteClient);


module.exports = router;







