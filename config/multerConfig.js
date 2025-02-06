// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');


// // Configure Cloudinary
// cloudinary.config({
//     cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
//     api_key : process.env.CLOUDINARY_API_KEY,
//     api_secret : process.env.CLOUDINARY_API_SECRET,
// });

// // Set up Cloudinary storage engine
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'Zoom Creatives',  // Ensure this folder exists or Cloudinary allows it to be created
//       allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],  // Allowed formats
//       transformation: [{ width: 500, height: 500, crop: 'limit' }]  // For images
//     },
//   });
  

// const upload = multer({ storage: storage });

// module.exports = upload;








// ***************refactor and optimzed code*****************

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Ensure environment variables are loaded

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Ensure folder structure is dynamic based on request type or user role
        const folderName = process.env.CLOUDINARY_FOLDER || 'default_folder';

        return {
            folder: folderName,
            format: file.mimetype.split('/')[1], // Auto-detect file format
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            transformation: file.mimetype.startsWith('image') 
                ? [{ width: 500, height: 500, crop: 'limit' }] 
                : [], // Only transform images
        };
    },
});

// Multer Middleware
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
        }
        cb(null, true);
    },
});

module.exports = upload;






