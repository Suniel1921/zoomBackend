// ----------------------- Dependencies -----------------------
const upload = require('../config/multerConfig');
const ClientModel = require('../models/newModel/clientModel');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

// ----------------------- Constants -----------------------
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_STATUS = 'active';

// ----------------------- Email Configuration -----------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.PASSWORD, // Ensure this is an App Password
  },
});

// ----------------------- Utility Functions -----------------------

/**
 * Sends login credentials email to the client
 * @param {string} email - Client's email
 * @param {string} name - Client's name
 * @param {string} password - Client's password
 */
const sendCredentialsEmail = async (email, name, password) => {
  const mailOptions = {
    from: process.env.MYEMAIL,
    to: email,
    subject: 'Your Login Credentials - CRM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to our CRM system!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>For security reasons, we recommend changing your password after your first login.</p>
        <p><a href="https://crm.zoomcreatives.jp/client-login" style="background-color: #FEDC00; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Login to Your Account</a></p>
        <p>If you have any questions, contact our support team.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Checks user authorization based on role
 * @param {string} role - User role
 * @param {string} superAdminId - Super admin ID
 * @param {string} userId - Current user ID
 * @param {string|null} targetId - Target resource ID (optional)
 */
const checkAuthorization = (role, superAdminId, userId, targetId = null) => {
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';

  if (!isSuperAdmin && (!superAdminId || !isAdmin)) {
    throw new Error('Unauthorized: Access denied.');
  }

  if (targetId && !isSuperAdmin && !isAdmin && userId !== targetId) {
    throw new Error('Unauthorized: You can only modify your own profile.');
  }
};

/**
 * Uploads profile photo to Cloudinary
 * @param {object} file - Uploaded file object
 * @param {string} clientId - Client ID for naming
 * @returns {string|null} - URL of uploaded photo or null
 */
const uploadProfilePhoto = async (file, clientId) => {
  if (!file) return null;

  if (file.size > MAX_SIZE) {
    throw new Error('Profile photo must be less than 2MB.');
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'client_profiles',
    public_id: `profile_${clientId || 'new'}`,
    width: 500,
    height: 500,
    crop: 'fill',
  });

  return result.secure_url;
};

/**
 * Validates required fields
 * @param {object} fields - Object with field values
 */
const validateRequiredFields = (fields) => {
  const missingField = Object.keys(fields).find(key => !fields[key]);
  if (missingField) {
    throw new Error(`${missingField.charAt(0).toUpperCase() + missingField.slice(1)} is required.`);
  }
};

// ----------------------- Client Controllers -----------------------

/**
 * Creates a new client
 */
exports.addClient = [
  upload.array('profilePhoto', 1),
  async (req, res) => {
    try {
      const { superAdminId, _id: createdBy, role } = req.user;
      checkAuthorization(role, superAdminId, createdBy);

      const {
        name, category, status, email, password, phone, nationality,
        postalCode, prefecture, city, street, building, modeOfContact,
        facebookUrl, timeline, dateJoined
      } = req.body;

      validateRequiredFields({ name, email, password, category });

      const existingClient = await ClientModel.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') } 
      });
      if (existingClient) {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
      }

      const profilePhotoUrl = await uploadProfilePhoto(req.files?.[0]);
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

      const newClient = await ClientModel.create({
        superAdminId: clientSuperAdminId,
        createdBy,
        name,
        category,
        status: status || DEFAULT_STATUS,
        email,
        password: hashedPassword,
        phone,
        nationality,
        postalCode,
        prefecture,
        city,
        street,
        building,
        modeOfContact,
        facebookUrl,
        timeline,
        dateJoined: dateJoined || new Date(),
        profilePhoto: profilePhotoUrl,
      });

      try {
        await sendCredentialsEmail(email, name, password);
        return res.status(201).json({
          success: true,
          message: 'Client created successfully. Login credentials have been sent via email.',
          client: newClient,
        });
      } catch (emailError) {
        console.warn('Email sending failed but client was created:', emailError.message);
        return res.status(201).json({
          success: true,
          message: 'Client created successfully. Failed to send email notification.',
          client: newClient,
          emailError: emailError.message,
        });
      }
    } catch (error) {
      console.error('Error creating client:', error.message);
      return res.status(error.code === 11000 ? 400 : 500).json({
        success: false,
        message: error.code === 11000 ? 'Email or phone number already exists.' : error.message || 'Internal Server Error',
        error: error.message,
      });
    }
  },
];

/**
 * Retrieves all clients based on user role
 */
exports.getClients = async (req, res) => {
  try {
    const { _id, role, superAdminId } = req.user;
    checkAuthorization(role, superAdminId, _id);

    const query = role === 'superadmin'
      ? { superAdminId: _id }
      : { $or: [{ createdBy: _id }, { superAdminId }] };

    const clients = await ClientModel.find(query)
      .populate('createdBy', 'name email')
      .lean();

    return res.status(200).json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/**
 * Retrieves a client by ID
 */
exports.getClientById = async (req, res) => {
  try {
    const { _id: superAdminId, role } = req.user;
    checkAuthorization(role, superAdminId, superAdminId);

    const client = await ClientModel.findById(req.params.id).lean();
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    delete client.password; // Remove password from response
    return res.status(200).json({ success: true, client });
  } catch (error) {
    console.error('Error fetching client:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/**
 * Updates an existing client
 */
exports.updateClient = [
  upload.single('profilePhoto'),
  async (req, res) => {
    try {
      const { _id: userId, role } = req.user;
      const clientId = req.params.id;

      const client = await ClientModel.findById(clientId);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      checkAuthorization(role, client.superAdminId, userId, clientId);

      const {
        name, category, status, email, phone, nationality, postalCode,
        prefecture, city, street, building, modeOfContact, facebookUrl,
      } = req.body;

      const profilePhotoUrl = await uploadProfilePhoto(req.file, clientId);
      if (profilePhotoUrl) client.profilePhoto = profilePhotoUrl;

      const updates = {
        name, category, status, email, phone, nationality, postalCode,
        prefecture, city, street, building, facebookUrl,
        modeOfContact: modeOfContact ? JSON.parse(modeOfContact) : client.modeOfContact,
      };

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) client[key] = updates[key];
      });

      const updatedClient = await client.save();
      const responseClient = updatedClient.toObject();
      delete responseClient.password;

      return res.status(200).json({
        success: true,
        message: 'Client updated successfully.',
        updatedClient: responseClient,
      });
    } catch (error) {
      console.error('Error updating client:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Error updating client.',
        error: error.message,
      });
    }
  },
];

/**
 * Deletes a client by ID
 */
exports.deleteClient = async (req, res) => {
  try {
    const { _id: superAdminId, role } = req.user;
    checkAuthorization(role, superAdminId, superAdminId);

    const client = await ClientModel.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting client:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Error deleting client.',
      error: error.message,
    });
  }
};

/**
 * Imports clients from CSV data
 */
exports.uploadCSVFile = async (req, res) => {
  try {
    const { superAdminId, _id: createdBy, role } = req.user;
    checkAuthorization(role, superAdminId, createdBy);

    if (!req.body.csvData) {
      return res.status(400).json({ success: false, message: 'No CSV data provided.' });
    }

    const csvData = req.body.csvData.trim();
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'Invalid CSV format: Missing data rows.' });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const clients = [];
    const emails = new Set();

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(r => r.trim());
      if (row.length !== headers.length) continue;

      const rowData = Object.fromEntries(headers.map((h, j) => [h, row[j] || '']));
      const email = rowData.email || `default${Date.now() + i}@example.com`;

      if (emails.has(email.toLowerCase())) continue; // Skip duplicate emails in CSV
      emails.add(email.toLowerCase());

      clients.push({
        superAdminId: role === 'superadmin' ? createdBy : superAdminId,
        createdBy,
        name: rowData.name || 'Default Name',
        email,
        city: rowData.city || 'City not provided',
        status: DEFAULT_STATUS,
        phone: rowData.phone || '',
        category: rowData.category || '',
        postalCode: rowData.postalCode || '0000000',
      });
    }

    const existingEmails = await ClientModel.distinct('email', {
      email: { $in: [...emails] },
    });
    const uniqueClients = clients.filter(client => !existingEmails.includes(client.email));

    if (uniqueClients.length === 0) {
      return res.status(400).json({ success: false, message: 'All emails in CSV already exist.' });
    }

    await ClientModel.insertMany(uniqueClients, { ordered: false });
    return res.status(200).json({
      success: true,
      message: 'CSV data imported successfully.',
      importedCount: uniqueClients.length,
      skippedCount: clients.length - uniqueClients.length,
    });
  } catch (error) {
    console.error('Error importing CSV:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error importing CSV data.',
      error: error.message,
    });
  }
};

/**
 * Tests email configuration
 */
exports.testEmailConfig = async (req, res) => {
  try {
    console.log('Testing email configuration:', {
      email: process.env.MYEMAIL,
      password: process.env.PASSWORD ? 'Set' : 'Not set',
    });
    await transporter.verify();
    return res.status(200).json({ success: true, message: 'Email configuration is valid.' });
  } catch (error) {
    console.error('Email configuration test failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Email configuration failed.',
      error: error.message,
    });
  }
};