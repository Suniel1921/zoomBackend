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
        enum: ['admin', 'superAdmin'],
        default: 'admin', //admin role just for testing purpose when set superadmin defualt value then not able to access /dashboard page redirect to client login page
      },
},{timestamps: true})

const SuperAdminModel = mongoose.model('SuperAdminModel', superAdminSchema);
module.exports = SuperAdminModel;

