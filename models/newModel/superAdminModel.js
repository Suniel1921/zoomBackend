const mongoose = require ('mongoose');
const superAdminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type : String,
        required: true,
    },
    role: {
        type: String,
        default: 'superadmin', 
    },

    superAdminPhoto: {
        type: String, 
        default: '', 
    },
    lastLogin: {
        type: Date,
        default: null,
    },


},{timestamps: true})

const SuperAdminModel = mongoose.model('SuperAdminModel', superAdminSchema);
module.exports = SuperAdminModel;

