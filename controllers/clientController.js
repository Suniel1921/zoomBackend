
// const upload = require('../config/multerConfig');
// const ClientModel = require('../models/newModel/clientModel');
// const bcrypt = require('bcryptjs'); 
// const cloudinary = require ('cloudinary').v2;





// // exports.addClient = async (req, res) => {
// //   const { name, category, status, email, password, phone, nationality, postalCode, prefecture,
// //     city, street, building, modeOfContact, socialMedia, timeline, dateJoined, profilePhoto } = req.body;

// //   try {
// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newClient = new ClientModel({
// //       name, category, status, email, password: hashedPassword, phone, nationality, postalCode,
// //       prefecture, city, street, building, modeOfContact, socialMedia, timeline, dateJoined,
// //       profilePhoto,
// //     });

// //     const savedClient = await newClient.save();
// //     res.status(201).json(savedClient);

// //   } catch (err) {
// //     const errorMessage = err.code === 11000 ? 'Email already exists' : err.message;
// //     res.status(400).json({ message: errorMessage });
// //   }
// // };



// // Add Client Endpoint
// exports.addClient = [
//   upload.array('profilePhoto', 1),
//   async (req, res) => {
//     try {
//       const {
//         name,
//         category,
//         status,
//         email,
//         password,
//         phone,
//         nationality,
//         postalCode,
//         prefecture,
//         city,
//         street,
//         building,
//         modeOfContact,
//         socialMedia,
//         timeline,
//         dateJoined,
//       } = req.body;

//       // Hash the password before saving
//   const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt

//       // console.log('req file is',req.files); 

//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ success: false, message: 'No file uploaded' });
//       }

//       const profilePhotoUrls = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         profilePhotoUrls.push(result.secure_url);
//       }

//       const createClient = await ClientModel.create({
//         name,
//         category,
//         status,
//         email,
//         password:hashedPassword,
//         phone,
//         nationality,
//         postalCode,
//         prefecture,
//         city,
//         street,
//         building,
//         modeOfContact,
//         socialMedia,
//         timeline,
//         dateJoined,
//         profilePhoto: profilePhotoUrls[0],
//       });

//       return res.status(201).json({ success: true, message: 'Client Created Successfully', createClient });
//     } catch (error) {
//       return res.status(500).json({ success: false, message: 'Internal Server Error', error });
//     }
//   },
// ];




// // Get all clients
// exports.getClients = async (req, res) => {
//   try {
//     const clients = await ClientModel.find();
//     res.json(clients);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get a single client by ID
// exports.getClientById = async (req, res) => {
//   try {
//     const client = await ClientModel.findById(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json(client);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




  

// // Update an existing client
// // exports.updateClient = async (req, res) => {
// //     try {
// //       const client = await ClientModel.findById(req.params.id);
// //       if (!client) {
// //         return res.status(404).json({ message: 'Client not found' });
// //       }
  
// //       // Update fields if provided in the request body
// //       const { name, email, phone, nationality, category, status } = req.body;
// //       client.name = name || client.name;
// //       client.email = email || client.email;
// //       client.phone = phone || client.phone;
// //       client.nationality = nationality || client.nationality;
// //       client.category = category || client.category;
// //       client.status = status || client.status;
  
// //       // Save the updated document
// //       const updatedClient = await client.save();
// //       // const updatedClient = await client.save();
// //       res.status(200).json(updatedClient);
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   };










// // Controller for updating the client
// exports.updateClient = async (req, res) => {
//   try {
//     // Find the client by ID
//     const client = await ClientModel.findById(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }

//     // Destructure the request body
//     const {
//       name,
//       category,
//       status,
//       email,
//       password,
//       phone,
//       nationality,
//       postalCode,
//       prefecture,
//       city,
//       street,
//       building,
//       modeOfContact,
//       socialMedia,
//       // profilePhoto,
//     } = req.body;

//     // Update client fields if provided, otherwise keep existing values
//     client.name = name || client.name;
//     client.category = category || client.category;
//     client.status = status || client.status;
//     client.email = email || client.email;
//     client.phone = phone || client.phone;
//     client.nationality = nationality || client.nationality;
//     client.postalCode = postalCode || client.postalCode;
//     client.prefecture = prefecture || client.prefecture;
//     client.city = city || client.city;
//     client.street = street || client.street;
//     client.building = building || client.building;
//     client.modeOfContact = modeOfContact || client.modeOfContact;
//     client.socialMedia = socialMedia || client.socialMedia;
//     client.password = password || client.password;
//     // client.profilePhoto = profilePhoto || client.profilePhoto;

//     // Optionally update password (ensure password is hashed before saving if needed)
//     // if (password) {
//     //   client.credentials.password = password; // You can hash this if necessary before saving
//     // }

//     // Save the updated client data to the database
//     const updatedClient = await client.save();

//     // Return the updated client object in the response
//     res.status(200).json(updatedClient);
//   } catch (err) {
//     console.error('Error updating client:', err);
//     res.status(400).json({ message: 'Error updating client. Please try again later.' });
//   }
// };


 
  
  


// //delete client
// exports.deleteClient = async (req, res) => {
//     const clientId = req.params.id; 
//     try {
//       const client = await ClientModel.findByIdAndDelete(clientId);
//       if (!client) {
//         return res.status(404).json({ success: false, message: 'Client not found.' });
//       }
//       res.status(200).json({ success: true, message: 'Client deleted successfully.' });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Something went wrong.' });
//     }
//   };













// ******************showing client based data on the basis of super admin (this is also a norma user treat as for now) *************************


const upload = require('../config/multerConfig');
const ClientModel = require('../models/newModel/clientModel');
const bcrypt = require('bcryptjs'); 
const cloudinary = require ('cloudinary').v2;

exports.addClient = [
  upload.array('profilePhoto', 1),
  async (req, res) => {
    // const { superAdminId } = req.user; // Extract superAdminId from authenticated user
    const { _id: superAdminId } = req.user; // Getting user ID from the authenticated user
    if (!superAdminId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
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

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const profilePhotoUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        profilePhotoUrls.push(result.secure_url);
      }

      const createClient = await ClientModel.create({
        superAdminId,
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

      return res.status(201).json({ success: true, message: 'Client created successfully', createClient });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  },
];


//get all clients
exports.getClients = async (req, res) => {
  const { _id: superAdminId } = req.user;  // Get the super admin's id from the logged-in user
  
  if (!superAdminId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: SuperAdmin access required.' });
  }

  try {
    // Fetch clients where the superAdminId matches the logged-in user's superAdminId
    const clients = await ClientModel.find({ superAdminId }); 
    res.json({ success: true, clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//get client by id 
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




//update client 
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

    if (password) {
      client.password = await bcrypt.hash(password, 10); // Ensure password is hashed
    }

    const updatedClient = await client.save();
    res.status(200).json({ success: true, message: 'Client updated successfully.', updatedClient });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error updating client. Please try again later.', error: err });
  }
};


//delete client
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








