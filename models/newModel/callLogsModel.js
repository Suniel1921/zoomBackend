const mongoose = require ('mongoose');
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
    phone : {
        type: Number,
        required: false,
    },
    purpose : {
        type: String,
        required : false,
    },
    handler: {
        type: String,
        required : false,
    },
    followUp: {
        type: String,
        required: false,
        enum : ['Yes', 'No'],
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
},{timestamps: true})

const CallLogsModel = mongoose.model('CallLogsModel', callLogSchema);
module.exports = CallLogsModel;


//note : when user created (i mean data added) then show the note icon for all specific user and show the note icon and when  click on note icon then show the small pop up model with functionality add update realtime 