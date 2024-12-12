
const mongoose = require ('mongoose');

const authSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
        type: Number,
        required: true,
        trim: true,
        match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
      },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
        type: String,
        default: 'user',
    }
  }, { timestamps: true });
  

  const authModel = mongoose.model('authModel', authSchema);
module.exports = authModel;
