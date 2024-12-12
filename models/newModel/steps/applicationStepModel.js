
// const mongoose = require('mongoose');

// const applicationStepSchema = new mongoose.Schema({
//   stepNames: {
//     type: Map,
//     of: {
//       status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
//       // You can add more fields if necessary, e.g., color or description
//     },
//     required: false,
//   },
//   clientId: { type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'ClientModel'
// },
// });

// const applicationStepModel = mongoose.model('ApplicationStepModel', applicationStepSchema);

// module.exports = applicationStepModel;



const mongoose = require('mongoose');

const applicationStepSchema = new mongoose.Schema({
  stepNames: {
    type: Map,
    of: {
      status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
      
    },
    required: false,
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ClientModel'
  },
});

const applicationStepModel = mongoose.model('ApplicationStepModel', applicationStepSchema);

module.exports = applicationStepModel;
