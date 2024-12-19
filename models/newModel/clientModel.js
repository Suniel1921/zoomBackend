const mongoose = require('mongoose');

// const clientSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//         },
//     category: {
//         type: String,
//         required: true
//     },   
//     status: {type: String, enum: ['active', 'inactive'], default: 'active' }, 

//     email: {type: String,
//         required: true,
//         unique: true,
//      },
//      password: {
//         type: String,
//         required: true,
//     },
//     phone: {type: String,
//         required: true,
//     },
   
//     nationality: {
//         type: String,
//         // required: true,
//      },
//      postalCode : {
//         type: Number,
//         required: true,
//     },
//     prefecture:{
//         type: String,
//         required: true,
//     },
//     city: {
//         type: String,
//         required: true,
//     },
//     street: {
//         type: String,
//         required: true,
//     },
//     building:{
//         type: String,
//         required: true,
//     },
//     contactPreferences: {
//         type: [String],
//         enum: ['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messager'],
//       },      
//     facebookProfileURL:{
//         type: String,
//         required: true,
//     },  
   
//     profilePhoto: {
//         type: String,
//     },
//   },
//   { timestamps: true }
// );

// const ClientModel = mongoose.model('ClientModel', clientSchema);

// module.exports = ClientModel;









const clientSchema = new mongoose.Schema({
   superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'SuperAdminModel',
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    nationality: { type: String },
    postalCode: { type: String },
    prefecture: { type: String },
    city: { type: String },
    street: { type: String },
    building: { type: String },
    modeOfContact: { type: [String] },
    socialMedia: { type: Object },
    timeline: { type: Array },
    dateJoined: { type: Date },
    profilePhoto: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
  }
  }, { timestamps: true });
  


const ClientModel = mongoose.model('ClientModel', clientSchema);

module.exports = ClientModel;

