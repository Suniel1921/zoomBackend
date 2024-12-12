const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        },
    email: {type: String,
        required: true,
        unique: true,
     },
    phone: {type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    nationality: {
        type: String,
        // required: true,
     },
    category: {type: String,
        required: true
    },
    status: {type: String, enum: ['active', 'inactive'], default: 'active' },
    profilePhoto: {type: String },
  },
  { timestamps: true }
);

const ClientModel = mongoose.model('ClientModel', clientSchema);

module.exports = ClientModel;
