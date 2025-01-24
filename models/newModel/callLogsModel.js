// const mongoose = require ('mongoose');
// const callLogSchema = new mongoose.Schema({

//        superAdminId: {
//           type: mongoose.Schema.Types.ObjectId,
//           required: false,
//           ref: 'SuperAdminModel',
//         },
//         createdBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'AdminModel',
//           required: false,
//         },


//     name: {
//         type: String,
//         required: false,
//     }, 
//     phone : {
//         type: Number,
//         required: false,
//     },
//     purpose : {
//         type: String,
//         required : false,
//     },
//     handler: {
//         type: String,
//         required : false,
//     },
//     followUp: {
//         type: String,
//         required: false,
//         enum : ['Yes', 'No'],
//     },
//     remarks: {
//         type: String,
//         enum: ['Done', 'Working on it', 'Stuck', 'Complete'],
//         required: false,
//     }
// },{timestamps: true})

// const CallLogsModel = mongoose.model('CallLogsModel', callLogSchema);
// module.exports = CallLogsModel;









const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
    superAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'SuperAdminModel',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminModel',
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    phone: {
        type: Number,
        required: false,
    },
    purpose: {
        type: String,
        required: false,
    },
    handler: {
        type: String,
        required: false,
    },
    followUp: {
        type: String,
        required: false,
        enum: ['Yes', 'No'],
    },
    remarks: {
        type: String,
        enum: ['Done', 'Working on it', 'Stuck', 'Complete'],
        required: false,
    },
    notes: {
        type: [String],
        required: true,
    }
}, { timestamps: true });

const CallLogsModel = mongoose.model('CallLogsModel', callLogSchema);
module.exports = CallLogsModel;