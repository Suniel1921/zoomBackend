const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
   superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'SuperAdminModel',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminModel', 
      required: true,
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




//this is my code structure and this is code not working as exptected . let me clarify there is a superadmin called ram and ram added two admin mohan and shyam and mohan and shyam added a one one client and let super admin also add one client so i want to all data see when they login like if mohan added one abc client then make sure superamdin ram and shyam also see this added data and vice verca how to handle this architecture i provide my code struturce 