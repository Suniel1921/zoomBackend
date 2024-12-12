const documentTranslationModel = require('../models/newModel/documentTranslationModel');

// CREATE Document Translation
exports.createDocumentTranslation = async (req, res) => {
  const {
    clientId,
    sourceLanguage,
    targetLanguage,
    nameInTargetScript,
    pages,
    amount,
    paymentStatus,
    paymentMethod,
    handledBy,
    deadline,
    translationStatus,
    deliveryType,
  } = req.body;

  try {
    const newTranslation = new documentTranslationModel({
      clientId,
      sourceLanguage,
      targetLanguage,
      nameInTargetScript,
      pages,
      amount,
      paymentStatus,
      paymentMethod,
      handledBy,
      deadline,
      translationStatus,
      deliveryType,
    });

    await newTranslation.save();
    res.status(201).json({success: true, message: 'document data created', newTranslation});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error creating translation' });
  }
};

// GET all Document Translations
// GET all Document Translations
exports.getAllDocumentTranslation = async (req, res) => {
  try {
    const translations = await documentTranslationModel.find().populate('clientId');  // Populate client info

    // Check if the length of translations is 0 or less
    if (translations.length <= 0) {
      return res.status(404).json({ success: false, message: 'No document translations found' });
    }

    res.status(200).json({ success: true, message: 'Document translations fetched successfully', translations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching translations' });
  }
};

// GET Document Translation by ID
exports.getDocumentTranslationByID = async (req, res) => {
  const { id } = req.params;
  try {
    const translation = await documentTranslationModel.findById(id).populate('clientId');
    if (!translation) {
      return res.status(404).json({success: false, message: 'Translation not found' });
    }
    res.status(200).json({sucess: true, meessage: 'fetched document translation data by id', translation});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error fetching translation' });
  }
};

// UPDATE Translation by ID
exports.updateDocumentTranslation = async (req, res) => {
  const { id } = req.params;
  const {
    clientId,
    sourceLanguage,
    targetLanguage,
    nameInTargetScript,
    pages,
    amount,
    paymentStatus,
    paymentMethod,
    handledBy,
    deadline,
    translationStatus,
    deliveryType,
  } = req.body;

  try {
    const updatedTranslation = await documentTranslationModel.findByIdAndUpdate(id, {
      clientId,
      sourceLanguage,
      targetLanguage,
      nameInTargetScript,
      pages,
      amount,
      paymentStatus,
      paymentMethod,
      handledBy,
      deadline,
      translationStatus,
      deliveryType,
    }, { new: true }); // { new: true } to return the updated document

    if (!updatedTranslation) {
      return res.status(404).json({success: false, message: 'Translation not found' });
    }

    res.status(200).json({success: true, message: 'document translation udpated', updatedTranslation});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error updating translation' });
  }
};

// DELETE Translation by ID
exports.deleteDocumentTranslation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTranslation = await documentTranslationModel.findByIdAndDelete(id);
    if (!deletedTranslation) {
      return res.status(404).json({ success: false, message: 'Translation not found' });
    }
    res.status(200).json({ success: true, message: 'Translation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting translation' });
  }
};

