const mongoose = require("mongoose");
const defaultSteps = require("./defaultSteps");

const additionalClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  applicationType: {
    type: String,
    enum: [
      "Newborn Child",
      "Passport Renewal",
      "Lost Passport",
      "Damaged Passport",
      "Travel Document",
      "Birth Registration",
    ],
    required: true,
  },
});

const epassportSchema = new mongoose.Schema(
  {
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SuperAdminModel",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminModel",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ClientModel",
    },
    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "completed", "in-progress", "processing"],
          default: "completed",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    mobileNo: { type: String, required: true },
    contactChannel: {
      type: String,
      enum: ["Viber", "Facebook", "WhatsApp", "Friend", "Office Visit"],
      required: true,
    },
    applicationType: {
      type: String,
      enum: [
        "Newborn Child",
        "Passport Renewal",
        "Lost Passport",
        "Damaged Passport",
        "Travel Document",
        "Birth Registration",
      ],
      required: true,
    },
    ghumtiService: { type: Boolean, required: true },
    prefecture: { type: String, required: false },
    amount: { type: Number, min: 0, required: true },
    paidAmount: { type: Number, min: 0, required: true },
    dueAmount: { type: Number, min: 0, required: true },
    discount: { type: Number, min: 0, required: true },
    paymentStatus: {
      type: String,
      enum: ["Due", "Partial", "Paid"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Furicomy", "Counter Cash", "Credit Card", "Paypay"],
      required: false,
    },
    applicationStatus: {
      type: String,
      enum: ["Processing", "Waiting for Payment", "Completed", "Cancelled"],
      required: true,
    },
    dataSentStatus: {
      type: String,
      enum: ["Not Sent", "Sent"],
      required: true,
    },
    handledBy: { type: String },
    date: { type: Date, required: true },
    deadline: { type: Date, required: true },
    remarks: { type: String, required: false },
    clientFiles: { type: [String], default: [] },
    additionalClients: { type: [additionalClientSchema], default: [] },
  },
  { timestamps: true }
);

epassportSchema.pre("save", function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.ePassportStep;
  }
  next();
});

const ePassportModel = mongoose.model("ePassportModel", epassportSchema);
module.exports = ePassportModel;