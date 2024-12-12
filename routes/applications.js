const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Application } = require('../models');

// Get all applications
router.get('/', protect, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: req.user.role === 'client' ? { clientId: req.user.id } : {}
    });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get single application
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// Create application
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
});

// Update application
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    await application.update(req.body);
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

// Delete application
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    await application.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

module.exports = router;