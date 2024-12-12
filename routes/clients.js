const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Client, User } = require('../models');

// Get all clients
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [{ model: User, attributes: ['email', 'status'] }]
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
});

// Get single client
router.get('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['email', 'status'] }]
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if user has permission to view client
    if (req.user.role === 'client' && req.user.id !== client.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this client'
      });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
});

// Create client
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { email, password, ...clientData } = req.body;

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'client'
    });

    // Create client profile
    const client = await Client.create({
      ...clientData,
      userId: user.id
    });

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
});

// Update client
router.put('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if user has permission to update client
    if (req.user.role === 'client' && req.user.id !== client.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this client'
      });
    }

    await client.update(req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
});

// Delete client
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Delete associated user account
    await User.destroy({ where: { id: client.userId } });
    
    // Client will be automatically deleted due to CASCADE
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
});

module.exports = router;