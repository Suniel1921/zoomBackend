const mongoose = require('mongoose');

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
    profilePhoto: { type: String, required: false },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
  }
  }, { timestamps: true });
  


const ClientModel = mongoose.model('ClientModel', clientSchema);

module.exports = ClientModel;

