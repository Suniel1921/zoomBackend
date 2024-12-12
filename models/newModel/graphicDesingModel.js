const mongoose = require("mongoose");

const graphicDesignSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ClientModel'
    },
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

// module.exports = mongoose.model("GraphicDesignJob", graphicDesignJobSchema);
const GraphicDesignModel = mongoose.model('GraphicDesignModel', graphicDesignSchema);
module.exports =  GraphicDesignModel;
