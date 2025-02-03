
// ******************showing client based data on the basis of super admin (this is also a normal user treat as for now) *************************


const upload = require('../config/multerConfig');
const { getRedisClient } = require('../config/redisClient');
const ClientModel = require('../models/newModel/clientModel');
const bcrypt = require('bcryptjs'); 
const cloudinary = require ('cloudinary').v2;


//create client controller

const nodemailer = require('nodemailer');
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.PASSWORD, 
  },
});


//get all clients controller

exports.addClient = [
  upload.array('profilePhoto', 1),
  async (req, res) => {
    const { superAdminId, _id: createdBy, role } = req.user;

    // If the user is a superadmin, they don't need superAdminId for client creation
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
        socialMedia,
        timeline,
        dateJoined,
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const profilePhotoUrls = [];
      for (const file of req.files) {
        if (file.size > MAX_SIZE) {
          return res.status(400).json({ success: false, message: 'Profile photo must be less than 2MB.' });
        }

        const result = await cloudinary.uploader.upload(file.path);
        profilePhotoUrls.push(result.secure_url);
      }

      // If the user is an admin, superAdminId will come from the req.user (the current logged-in superadmin)
      const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

      // Create the client with the correct superAdminId
      const createClient = await ClientModel.create({
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
        socialMedia,
        timeline,
        dateJoined,
        profilePhoto: profilePhotoUrls[0],
      });

      return res.status(201).json({
        success: true,
        message: 'Client created successfully',
        createClient,
      });
    } catch (error) {
      console.error('Error creating client:', error.message);
      return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  },
];





// **********fetching client from redis cache************


exports.getClients = async (req, res) => {
  const { _id, role, superAdminId } = req.user

  if (!role || (role !== "superadmin" && role !== "admin")) {
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." })
  }

  try {
    let query = {}
    let redisKey = ""

    if (role === "superadmin") {
      query = { superAdminId: _id }
      redisKey = `superadmin_clients:${_id}`
    } else if (role === "admin") {
      query = { $or: [{ createdBy: _id }, { superAdminId }] }
      redisKey = `admin_clients:${_id}`
    }

    const redisClient = await getRedisClient()
    const cachedClients = await redisClient.get(redisKey)

    let clients
    if (cachedClients && !req.query.forceRefresh) {
      console.log("Returning cached clients data from Redis")
      clients = JSON.parse(cachedClients)
    } else {
      console.log("Fetching fresh clients data from DB")
      clients = await ClientModel.find(query).populate("createdBy", "name email").exec()
      await redisClient.set(redisKey, JSON.stringify(clients), "EX", 300) // Cache for 5 minutes
    }

    return res.status(200).json({ success: true, clients })
  } catch (error) {
    console.error("Error fetching clients:", error.message)
    return res.status(500).json({ success: false, message: "Internal Server Error", error })
  }
}



exports.getClientById = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.updateClient = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

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
      socialMedia,
    } = req.body;

    // Update only provided fields
    client.name = name || client.name;
    client.category = category || client.category;
    client.status = status || client.status;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.nationality = nationality || client.nationality;
    client.postalCode = postalCode || client.postalCode;
    client.prefecture = prefecture || client.prefecture;
    client.city = city || client.city;
    client.street = street || client.street;
    client.building = building || client.building;
    client.modeOfContact = modeOfContact || client.modeOfContact;
    client.socialMedia = socialMedia || client.socialMedia;

    const updatedClient = await client.save();

    // Exclude sensitive fields from the response
    const responseClient = updatedClient.toObject();
    delete responseClient.password; 

    res.status(200).json({ success: true, message: 'Client updated successfully.', updatedClient: responseClient });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error updating client. Please try again later.',
      error: err.message,
    });
  }
};




//update client profile from client side
exports.updateClientProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
  }

  try {
    const userId = req.user.id; 
    const { fullName, email, phone } = req.body; 

    const updatedUser = await ClientModel.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedClient: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};






//delete client controller
exports.deleteClient = async (req, res) => {
  const { _id: superAdminId } = req.user;
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    const client = await ClientModel.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.status(200).json({ success: true, message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
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





