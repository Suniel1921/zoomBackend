
// ******************showing client based data on the basis of super admin (this is also a normal user treat as for now) *************************


const upload = require('../config/multerConfig');
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
    // If the user is an admin, ensure superAdminId is provided
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

      // If the user is a superadmin, set superAdminId directly to the superadmin's ID
      // If the user is an admin, superAdminId will come from the req.user (the current logged-in superadmin)
      const clientSuperAdminId = role === 'superadmin' ? createdBy : superAdminId;

      // Create the client with the correct superAdminId
      const createClient = await ClientModel.create({
        superAdminId: clientSuperAdminId,  // set superAdminId
        createdBy,     // Track the admin who created this client
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






exports.getClients = async (req, res) => {
  const { _id, role, superAdminId } = req.user;

  if (!role || (role !== 'superadmin' && role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Access denied.' });
  }

  try {
    let query = {};

    if (role === 'superadmin') {
      // SuperAdmin: Fetch all clients under their `superAdminId`
      query = { superAdminId: _id };
    } else if (role === 'admin') {
      // Admin: Fetch clients created by the admin or under their `superAdminId`
      query = { $or: [{ createdBy: _id }, { superAdminId }] };
    }

    const clients = await ClientModel.find(query)
      .populate('createdBy', 'name email') // Populate who created the client
      .exec();

    return res.status(200).json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};


// exports.getClients = async (req, res) => {
//   const { _id: superAdminId } = req.user;  
  
//   if (!superAdminId) {
//     return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
//   }

//   try {
//     // Fetch clients where the superAdminId matches the logged-in user's superAdminId
//     const clients = await ClientModel.find({ superAdminId }); 
//     res.json({ success: true, clients });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


//get client by id controller






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




//update client controller
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
      // password,
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

    // if (password) {
    //   client.password = await bcrypt.hash(password, 10); 
    // }

    const updatedClient = await client.save();
    res.status(200).json({ success: true, message: 'Client updated successfully.', updatedClient });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error updating client. Please try again later.', error: err });
  }
};



//update client profile from client side


// exports.updateClientProfile = async (req, res) => {
//   try {
//     // Ensure the user exists (could also be checked in requireLogin if needed)
//     const userId = req.user.id;  // Get user ID from the token
//     const { fullName, email, phone } = req.body;  // Destructure data from the request body

//     // Find the user by ID and update
//     const updatedUser = await ClientModel.findByIdAndUpdate(
//       userId,
//       { fullName, email, phone },
//       { new: true }  // Return the updated document
//     );

//     // If user is not found
//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Respond with success and the updated user data
//     return res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       updatedClient: updatedUser,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Error updating profile', error: error.message });
//   }
// };



// controllers/profileController.js
exports.updateClientProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
  }

  try {
    const userId = req.user.id; // Get user ID from the token
    const { fullName, email, phone } = req.body; // Destructure data from the request body

    const updatedUser = await ClientModel.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true } // Return the updated document
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




const fs = require('fs');
const csvParser = require('csv-parser');
const multer = require('multer');
const path = require('path');


// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up local storage for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Folder to store uploaded files temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
  },
});

// Multer configuration for CSV upload
const uploadCSV = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});

// Route for uploading CSV file
exports.UploadCSVFile = [uploadCSV.single('csvFile'), async (req, res) => {
  // const { superAdminId } = req.user; // Ensure user is authenticated and has super admin role
  const { superAdminId, _id: createdBy, role } = req.user;

  // Role-based check: Only 'superadmin' or 'admin' are allowed
  if (role !== "superadmin" && (!superAdminId || role !== "admin")) {
    console.log("Unauthorized access attempt:", req.user); // Log for debugging
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Access denied." });
  }

  // If the user is a superadmin, use their userId as superAdminId
  const clientSuperAdminId = role === "superadmin" ? createdBy : superAdminId;

  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  console.log('File uploaded to:', req.file.path); // Log the file path for debugging

  const results = [];

  // Parse the CSV file and store each row
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      try {
        // Map and save data to the database
        const clients = results.map((row) => {
          return {
            superAdminId: clientSuperAdminId,
            createdBy, 
            name: row.name || 'Default Name',   
            email: row.email || 'default@example.com',  // Default email if not provided
            city: row.city || 'City not provided',  // Default city if not provided
            status: 'active', // You can adjust this as needed
            phone : row.phone,
          };
        });

        await ClientModel.insertMany(clients); // Bulk insert data into the database
        res.status(200).send('CSV data imported successfully');
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error importing CSV data', error: err });
      } finally {
        // Delete the uploaded CSV file after processing
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        } else {
          console.log('File not found for deletion:', req.file.path);
        }
      }
    });
}];




// const fs = require('fs');
// const csvParser = require('csv-parser');
// const multer = require('multer');
// const path = require('path');


// // Ensure the 'uploads' folder exists
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Set up local storage for CSV file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Folder to store uploaded files temporarily
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
//   },
// });

// // Multer configuration for CSV upload
// const uploadCSV = multer({ 
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     if (ext !== '.csv') {
//       return cb(new Error('Only CSV files are allowed'), false);
//     }
//     cb(null, true);
//   }
// });

// // Route for uploading CSV file
// exports.UploadCSVFile = [uploadCSV.single('csvFile'), (req, res) => {
//   const { _id: superAdminId } = req.user;
//   if (!superAdminId) {
//     return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
//   }

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   console.log('File uploaded to:', req.file.path); // Log the file path for debugging

//   const results = [];

//   // Parse the CSV file and store each row
//   fs.createReadStream(req.file.path)
//     .pipe(csvParser())
//     .on('data', (row) => {
//       results.push(row);
//     })
//     .on('end', async () => {
//       try {
//         // Map and save data to the database
//         const clients = results.map((row) => {
//           return {
//             name: row.name || 'Default Name',   // Ensure name is set, otherwise default
//             email: row.email || 'default@example.com',  // Default email if not provided
//             city: row.city || 'city not found in your CSV file',  // Default address if not provided
//           };
//         });

//         await ClientModel.insertMany(clients); // Bulk insert data into the database
//         res.status(200).send('CSV data imported successfully');
//       } catch (err) {
//         console.error(err);
//         res.status(500).json({sucess: false, message : 'Error importing CSV data', err});
//       } finally {
//         // Delete the uploaded CSV file after processing
//         if (fs.existsSync(req.file.path)) {
//           fs.unlinkSync(req.file.path);
//         } else {
//           console.log('File not found for deletion:', req.file.path);
//         }
//       }
//     });
// }];
