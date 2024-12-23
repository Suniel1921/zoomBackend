const documentTranslationModel = require('../models/newModel/documentTranslationModel');


// CREATE Document Translation controller
exports.createDocumentTranslation = async (req, res) => {
  const { _id: superAdminId } = req.user;
  const {
    clientId,
    steps,
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

  // Use custom steps if provided, otherwise leave it undefined
  const applicationSteps = steps && Array.isArray(steps) ? steps : []; 

  try {
    const newTranslation = new documentTranslationModel({
      superAdminId,
      clientId,
      steps: applicationSteps, // Direct assignment of steps
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
    res.status(201).json({ success: true, message: 'Document translation created successfully', newTranslation });
  } catch (error) {
    console.error('Error creating document translation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating document translation',
      error: error.message,
    });
  }
};





// GET All Document Translations for Authenticated Super Admin
exports.getAllDocumentTranslation = async (req, res) => {
  const { _id: superAdminId } = req.user; 

  try {
    // Query to fetch all translations belonging to the authenticated super admin
    const translations = await documentTranslationModel
      .find({ superAdminId }) 
      .populate('clientId'); 

    // Check if no translations are found
    if (!translations || translations.length === 0) {
      return res.status(404).json({ success: false, message: 'No document translations found' });
    }

    // Return successful response with translations
    res.status(200).json({
      success: true,
      message: 'Document translations fetched successfully',
      translations,
    });
  } catch (error) {
    console.error('Error fetching document translations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching translations',
      error: error.message,
    });
  }
};




// GET Document Translation by ID for Authenticated Super Admin
exports.getDocumentTranslationByID = async (req, res) => {
  const { id } = req.params; 
  const { _id: superAdminId } = req.user; 

  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    // Find the document that matches the ID and superAdminId
    const translation = await documentTranslationModel
      .findOne({ _id: id, superAdminId })
      .populate('clientId'); // Populate client info if needed

    if (!translation) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized to access' });
    }

    res.status(200).json({ success: true, message: 'Document fetched successfully', translation });
  } catch (error) {
    console.error('Error fetching document translation by ID:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching translation', error: error.message });
  }
};



// UPDATE Document Translation by ID for Authenticated Super Admin
exports.updateDocumentTranslation = async (req, res) => {
  const { id } = req.params; // Document ID
  const { _id: superAdminId } = req.user; 

  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

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
    // Find and update the document that matches the ID and superAdminId
    const updatedTranslation = await documentTranslationModel.findOneAndUpdate(
      { _id: id, superAdminId }, // Match both ID and superAdminId
      {
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
      },
      { new: true } 
    );

    if (!updatedTranslation) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized to update' });
    }

    res.status(200).json({ success: true, message: 'Document updated successfully', updatedTranslation });
  } catch (error) {
    console.error('Error updating document translation:', error.message);
    res.status(500).json({ success: false, message: 'Error updating translation', error: error.message });
  }
};


// DELETE Document Translation by ID for Authenticated Super Admin
exports.deleteDocumentTranslation = async (req, res) => {
  const { id } = req.params; 
  const { _id: superAdminId } = req.user; 

  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    // Find and delete the document that matches the ID and superAdminId
    const deletedTranslation = await documentTranslationModel.findOneAndDelete({
      _id: id,
      superAdminId,
    });

    if (!deletedTranslation) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized to delete' });
    }

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document translation:', error.message);
    res.status(500).json({ success: false, message: 'Error deleting translation', error: error.message });
  }
};




