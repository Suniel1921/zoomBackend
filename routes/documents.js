const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const { Document } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all documents
router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: req.user.role === 'client' ? { clientId: req.user.id } : {}
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
});

// Get single document
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has permission to view document
    if (req.user.role === 'client' && req.user.id !== document.clientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this document'
      });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
});

// Upload document
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const document = await Document.create({
      ...req.body,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      clientId: req.user.role === 'client' ? req.user.id : req.body.clientId
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// Update document
router.put('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has permission to update document
    if (req.user.role === 'client' && req.user.id !== document.clientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this document'
      });
    }

    await document.update(req.body);
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has permission to delete document
    if (req.user.role === 'client' && req.user.id !== document.clientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    await document.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
});

module.exports = router;