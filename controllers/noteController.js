const noteModel = require('../models/newModel/noteModel');

// Get all notes for a specific super admin
// exports.getNotesBySuperAdmin = async (req, res) => {
//     try {
//       const { _id: superAdminId } = req.user;
//       console.log('Fetching notes for SuperAdmin ID:', superAdminId);
//       const notes = await noteModel.find({ superAdminId });
//       console.log(notes)
//       if (!notes || notes.length === 0) {
//         return res.status(404).json({ error: 'No notes found' });
//       }
//       res.status(200).json(notes);
//     } catch (err) {
//       console.error('Error fetching notes:', err);
//       res.status(500).json({ error: 'Failed to fetch notes' });
//     }
//   };




//get all clients controller
exports.getNotesBySuperAdmin = async (req, res) => {
    const { _id: superAdminId } = req.user;  
    
    if (!superAdminId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
    }
  
    try {
      // Fetch clients where the superAdminId matches the logged-in user's superAdminId
      const notes = await noteModel.find({ superAdminId }); 
      res.json({ success: true, notes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  









// Get a single note by ID for a specific super admin
exports.getNoteById = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const noteId = req.params.id;

    const note = await noteModel.findOne({ _id: noteId, superAdminId });
    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

// Create a new note for a specific super admin
exports.createNote = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    if (!superAdminId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
    }
  

    const { title, content, priority, reminders, subtasks } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const newNote = new noteModel({
      title,
      content,
      priority: priority || 'medium',
      reminders: reminders || [],
      subtasks: subtasks || [],
      superAdminId,
    });

    const savedNote = await newNote.save();

    res.status(201).json({ message: 'Note created successfully!', note: savedNote });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

// Update a note for a specific super admin
exports.updateNote = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user;
    const noteId = req.params.id;

    const note = await noteModel.findOne({ _id: noteId, superAdminId });
    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });

    const updatedNote = await noteModel.findByIdAndUpdate(noteId, req.body, { new: true });

    res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// Delete a note by ID for a specific super admin
exports.deleteNote = async (req, res) => {
  try {
    const { _id: superAdminId } = req.user; 
    const noteId = req.params.id;

    const note = await noteModel.findOne({ _id: noteId, superAdminId });
    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });

    await noteModel.findByIdAndDelete(noteId);

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
