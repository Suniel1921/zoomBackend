const upload = require('../config/multerConfig');
const ClientModel = require('../models/newModel/clientModel');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');


// Constants
const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes for file size validation

// Configure Nodemailer transporter for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.PASSWORD,
  },
});

// Add Client Controller
exports.addClient = [
  upload.array('profilePhoto', 1), // Allow only 1 profile photo upload
  async (req, res) => {
    const { superAdminId, _id: createdBy, role } = req.user;

    // Role-based access control
    if (role !== 'superadmin' && (!superAdminId || role !== 'admin')) {
      console.log('Unauthorized access attempt:', req.user);
      return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
    }

    try {
      const {
        name,
        category,
        status,
        email,
        password,
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
        dateJoined,
      } = req.body;

      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'phone',];
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.` });
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Upload profile photo to Cloudinary (if provided)
      let profilePhotoUrl = null;
      if (req.files && req.files.length > 0) {
        const file = req.files[0];

        // Validate file size
        if (file.size > MAX_SIZE) {
          return res.status(400).json({ success: false, message: 'Profile photo must be less than 2MB.' });
        }

        try {
          const result = await cloudinary.uploader.upload(file.path);
          profilePhotoUrl = result.secure_url;
        } catch (error) {
          console.error('Cloudinary upload error:', error.message);
          return res.status(500).json({ success: false, message: 'Error uploading profile photo.' });
        }
      }

      // Determine superAdminId based on role
      const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

      // Create client in the database
      const newClient = await ClientModel.create({
        superAdminId: clientSuperAdminId,
        createdBy,
        name,
        category,
        status,
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
        dateJoined,
        profilePhoto: profilePhotoUrl,
      });

      // Send login credentials email
      const mailOptions = {
        from: process.env.MYEMAIL, // Sender address
        to: email, // Recipient address
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
          <p><a href="https://crm.zoomcreatives.jp/client-login" style="background-color: #fedc00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Login to Your Account</a></p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply directly to this email.</p>
        </div>
      `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error.message);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Client created successfully. Login credentials have been sent via email.',
        client: newClient,
      });
    } catch (error) {
      console.error('Error creating client:', error.message);

      // Handle specific errors
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Email or phone number already exists.' });
      }

      return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  },
];

// Get all Clients (without cache)
exports.getClients = async (req, res) => {
  const { _id, role, superAdminId } = req.user;

  // Authorization check
  if (!role || (role !== 'superadmin' && role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
  }

  try {
    // Initialize query based on role
    let query = {};
    switch (role) {
      case 'superadmin':
        query = { superAdminId: _id };
        break;
      case 'admin':
        query = { $or: [{ createdBy: _id }, { superAdminId }] };
        break;
      default:
        throw new Error('Unauthorized role');
    }

    // Fetch clients from the database
    const clients = await ClientModel.find(query)
      .populate('createdBy', 'name email') // Populate createdBy field with name and email
      .exec();

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Get Client by ID (without cache)
exports.getClientById = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const clientId = req.params.id;

    const client = await ClientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





// exports.updateClient = [
//   upload.single('profilePhoto'), // Multer middleware for file upload
//   async (req, res) => {
//     const { _id: superAdminId, role } = req.user;
//     if (!superAdminId) {
//       return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
//     }

//     // Authorization check
//     if (!role || (role !== 'superadmin' && role !== 'admin' && role !== 'user')) {
//       return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
//     }

//     try {
//       // Find the client by ID
//       const client = await ClientModel.findById(req.params.id);
//       if (!client) {
//         return res.status(404).json({ success: false, message: 'Client not found.' });
//       }

//       // Destructure the fields from the request body
//       const {
//         name,
//         category,
//         status,
//         email,
//         phone,
//         nationality,
//         postalCode,
//         prefecture,
//         city,
//         street,
//         building,
//         modeOfContact,
//         facebookUrl,
//       } = req.body;

//       // Check if a profile photo is being uploaded
//       if (req.file) {
//         try {
//           const result = await cloudinary.uploader.upload(req.file.path, {
//             folder: 'client_profiles',
//             public_id: `profile_${client._id}`,
//             width: 500,
//             height: 500,
//             crop: 'fill',
//           });

//           // Update client profile photo URL
//           client.profilePhoto = result.secure_url;
//         } catch (cloudinaryErr) {
//           console.error('Cloudinary upload error:', cloudinaryErr);
//           return res.status(500).json({
//             success: false,
//             message: 'Error uploading profile photo to Cloudinary.',
//             error: cloudinaryErr.message,
//           });
//         }
//       }

//       // Parse modeOfContact 
//       const parsedModeOfContact = modeOfContact ? JSON.parse(modeOfContact) : client.modeOfContact;

//       // Update other client details
//       client.name = name || client.name;
//       client.category = category || client.category;
//       client.status = status || client.status;
//       client.email = email || client.email;
//       client.phone = phone || client.phone;
//       client.facebookUrl = facebookUrl || client.facebookUrl;
//       client.nationality = nationality || client.nationality;
//       client.postalCode = postalCode || client.postalCode;
//       client.prefecture = prefecture || client.prefecture;
//       client.city = city || client.city;
//       client.street = street || client.street;
//       client.building = building || client.building;
//       client.modeOfContact = parsedModeOfContact;


//       // Save the updated client
//       const updatedClient = await client.save();

//       // Exclude sensitive fields from the response
//       const responseClient = updatedClient.toObject();
//       delete responseClient.password;

//       // Send the response with the updated client data
//       res.status(200).json({
//         success: true,
//         message: 'Client updated successfully.',
//         updatedClient: responseClient,
//       });
//     } catch (err) {
//       console.error('Error updating client:', err);
//       res.status(400).json({
//         success: false,
//         message: 'Error updating client. Please try again later.',
//         error: err.message,
//       });
//     }
//   },
// ];







exports.updateClient = [
  upload.single("profilePhoto"), // Multer middleware for file upload
  async (req, res) => {
    try {
      const { _id: userId, role } = req.user; // Extract user ID and role from token
      const clientId = req.params.id;

      // Find the client by ID
      const client = await ClientModel.findById(clientId);
      console.log('client id is ', clientId)
      if (!client) {
        return res.status(404).json({ success: false, message: "Client not found." });
      }

      // **✅ Authorization Check**
      // - Admins/Superadmins can update any client.
      // - Normal users can only update their own profile.
      if (role !== "superadmin" && role !== "admin" && clientId !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own profile." });
      }

      // **✅ Destructure the request body**
      const {
        name,
        category,
        status,
        email,
        phone,
        nationality,
        postalCode,
        prefecture,
        city,
        street,
        building,
        modeOfContact,
        facebookUrl,
      } = req.body;

      // **✅ Handle Profile Photo Upload (Cloudinary)**
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "client_profiles",
            public_id: `profile_${client._id}`,
            width: 500,
            height: 500,
            crop: "fill",
          });

          client.profilePhoto = result.secure_url; // Update profile photo URL
        } catch (cloudinaryErr) {
          console.error("Cloudinary upload error:", cloudinaryErr);
          return res.status(500).json({
            success: false,
            message: "Error uploading profile photo to Cloudinary.",
            error: cloudinaryErr.message,
          });
        }
      }

      // **✅ Fix `modeOfContact` Parsing**
      let parsedModeOfContact;
      try {
        parsedModeOfContact = modeOfContact ? JSON.parse(modeOfContact) : client.modeOfContact;
      } catch (err) {
        parsedModeOfContact = client.modeOfContact; // Fallback if JSON parsing fails
      }

      // **✅ Update Other Client Details**
      client.name = name || client.name;
      client.category = category || client.category;
      client.status = status || client.status;
      client.email = email || client.email;
      client.phone = phone || client.phone;
      client.facebookUrl = facebookUrl || client.facebookUrl;
      client.nationality = nationality || client.nationality;
      client.postalCode = postalCode || client.postalCode;
      client.prefecture = prefecture || client.prefecture;
      client.city = city || client.city;
      client.street = street || client.street;
      client.building = building || client.building;
      client.modeOfContact = parsedModeOfContact;

      // **✅ Save the Updated Client**
      const updatedClient = await client.save();

      // **✅ Remove Password from Response**
      const responseClient = updatedClient.toObject();
      delete responseClient.password;

      // **✅ Send Success Response**
      res.status(200).json({
        success: true,
        message: "Client updated successfully.",
        updatedClient: responseClient,
      });
    } catch (err) {
      console.error("Error updating client:", err);
      res.status(400).json({
        success: false,
        message: "Error updating client. Please try again later.",
        error: err.message,
      });
    }
  },
];








// Delete Client (without cache)
exports.deleteClient = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const clientId = req.params.id;
    const client = await ClientModel.findByIdAndDelete(clientId);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully.',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error deleting client.' });
  }
};






// *******************clients import(csv file)  ********************



exports.uploadCSVFile = async (req, res) => {
  const { superAdminId, _id: createdBy, role } = req.user;

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
    console.log("Unauthorized access attempt:", req.user); // Log for debugging
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
  }

  const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

  // Check if CSV data is provided in the request body
  if (!req.body.csvData) {
    return res.status(400).json({ success: false, message: "No CSV data provided" });
  }

  const results = [];
  const csvData = req.body.csvData;

  // Parse the CSV data
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length === headers.length) {
      const rowData = {};
      for (let j = 0; j < headers.length; j++) {
        rowData[headers[j]] = row[j];
      }
      results.push(rowData);
    }
  }

  try {
    // Map and save data to the database
    const clients = results.map((row) => ({
      superAdminId: clientSuperAdminId,
      createdBy,
      name: row.name || 'Default Name',
      email: row.email || 'default@example.com',
      city: row.city || 'City not provided',
      status: 'active',
      phone: row.phone,
      category: row.category,
      postalCode: row.postalCode || "0000000",
    }));

    await ClientModel.insertMany(clients); // Bulk insert data into the database
    res.status(200).json({ success: true, message: 'CSV data imported successfully' });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ success: false, message: 'Error importing CSV data', error: err.message });
  }
};

