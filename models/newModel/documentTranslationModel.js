const mongoose = require("mongoose");
const defaultSteps = require("./defaultSteps");

const documentTranslationSchema = new mongoose.Schema(
  {
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SuperAdminModel",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminModel", // Can be a super admin or admin
      required: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientModel",
      required: true,
    },

    clientFiles: {
      type: [String], // Array of URLs
      default: [], // Default to empty array
    },

    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "completed", "in-progress", "processing"],
          default: "complted",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    sourceLanguage: {
      type: String,
      enum: ["English", "Japanese", "Nepali", "Hindi"],
      required: true,
    },
    targetLanguage: {
      type: String,
      enum: ["English", "Japanese", "Nepali", "Hindi"],
      required: true,
    },
    nameInTargetScript: {
      type: String,
      required: false,
    },
    pages: {
      type: Number,
      min: 1,
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    paidAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Due", "Paid"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Counter Cash",
        "Bank Transfer",
        "Credit Card",
        "Paypay",
        "Line Pay",
      ],
    },
    handledBy: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    translationStatus: {
      type: String,
      enum: ["Processing", "Waiting for Payment", "Completed", "Cancelled"],
      required: true,
    },
    deliveryType: {
      type: String,
      enum: [
        "Office Pickup",
        "Sent on Email",
        "Sent on Viber",
        "Sent on Facebook",
        "By Post",
      ],
      required: true,
    },
    // Additional Information
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware to auto-populate steps if not provided
documentTranslationSchema.pre("save", function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.documentTranslationStep; // Populate default steps
  }
  next();
});

const documentTranslationModel = mongoose.model(
  "documentTranslationModel",
  documentTranslationSchema
);
module.exports = documentTranslationModel;
