const mongoose = require("mongoose");
const defaultSteps = require("./defaultSteps");

const graphicDesignSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SuperAdminModel',
  },
  
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClientModel'
    },

    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'completed', 'in-progress', 'processing'],
          default: 'complted',
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  businessName: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true
  },
  landlineNo: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: true
  },
  designType: {
    type: String,
    enum: ['Logo Design', 'Advertisement Design', 'Menu Design', 'Chirasi Design','Meisi Design','Flag Design','Kanban Design','Poster Design', 'Rice Feeding Banner','SNS Banner Design','Invitation Card Design',], 
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  advancePaid: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Cancelled'],
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  dueAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Due'],
    required: true
  }
}, { timestamps: true });



// Middleware to auto-populate steps if not provided
graphicDesignSchema.pre('save', function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.graphicDesignStep; // Populate default steps
  }
  next();
});

// module.exports = mongoose.model("GraphicDesignJob", graphicDesignJobSchema);
const GraphicDesignModel = mongoose.model('GraphicDesignModel', graphicDesignSchema);
module.exports =  GraphicDesignModel;
