const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
   superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'SuperAdminModel',
    },
    name: {
      type: String,
      required: false
    },

    category: {
      type: String,
      required: false
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    email: {
      type: String,
      required: false,
      // unique: true,
    },

    password: {
      type: String,
      required: false
    },
    
    phone: {
      type: String
    },
    nationality: {
      type: String
    },
    postalCode: {
      type: String
    },
    prefecture: {
      type: String
    },
    city: {
      type: String
    },
    street: {
      type: String
    },
    building: {
      type: String
    },
    modeOfContact: {
      type: [String]
    },
    socialMedia: {
      type: []
    },


    timeline: {
      type: Array
    },
    dateJoined: {
      type: Date
    },
    profilePhoto: {
      type: String,
      required: false
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
  }
  }, { timestamps: false });
  


const ClientModel = mongoose.model('ClientModel', clientSchema);

module.exports = ClientModel;




